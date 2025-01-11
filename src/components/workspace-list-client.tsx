"use client";

import { useState, useEffect } from "react";
import { Plus, Clock, Star, Grid, Search, Settings, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useModal } from "@/hooks/use-modal-store";
import { cn } from "@/lib/utils";
import { Workspace } from "@prisma/client";
import { ScrollArea } from "./ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";

interface WorkspaceListClientProps {
  workspaces: (Workspace & {
    _count: {
      members: number;
      channels: number;
    };
  })[];
}

type ViewMode = "grid" | "list";
type SortMode = "recent" | "name" | "members";

export default function WorkspaceListClient({
  workspaces
}: WorkspaceListClientProps) {
  const router = useRouter();
  const { onOpen } = useModal();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortMode, setSortMode] = useState<SortMode>("recent");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem("favoriteWorkspaces");
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  // Save favorites to localStorage
  const toggleFavorite = (workspaceId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(workspaceId)) {
        newFavorites.delete(workspaceId);
      } else {
        newFavorites.add(workspaceId);
      }
      localStorage.setItem("favoriteWorkspaces", JSON.stringify([...newFavorites]));
      return newFavorites;
    });
  };

  const filteredWorkspaces = workspaces
    .filter(workspace => 
      workspace.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortMode) {
        case "name":
          return a.name.localeCompare(b.name);
        case "members":
          return b._count.members - a._count.members;
        case "recent":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const favoriteWorkspaces = filteredWorkspaces.filter(w => favorites.has(w.id));
  const nonFavoriteWorkspaces = filteredWorkspaces.filter(w => !favorites.has(w.id));

  return (
    <div className="h-full bg-zinc-50 dark:bg-zinc-900">
      <div className="h-full max-w-6xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Your Workspaces
          </h1>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => onOpen("createWorkspace")}
                  className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create a Workspace
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Create new workspace (Ctrl/⌘ + N)
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search workspaces..."
              className="pl-10 bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
            />
          </div>
          <TooltipProvider>
            <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 rounded-md p-1 border border-zinc-200 dark:border-zinc-700">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "h-8 w-8",
                      viewMode === "grid" && "bg-zinc-100 dark:bg-zinc-700"
                    )}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Grid view</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "h-8 w-8",
                      viewMode === "list" && "bg-zinc-100 dark:bg-zinc-700"
                    )}
                  >
                    <svg 
                      className="h-4 w-4" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M4 6h16M4 12h16M4 18h16" 
                      />
                    </svg>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>List view</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="h-10 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          >
            <option value="recent">Sort by Recent</option>
            <option value="name">Sort by Name</option>
            <option value="members">Sort by Members</option>
          </select>
        </div>

        <ScrollArea className="h-[calc(100vh-12rem)]">
          {favoriteWorkspaces.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4 text-sm font-medium text-zinc-500">
                <Star className="h-4 w-4" />
                <span>Favorites</span>
              </div>
              <div className={cn(
                viewMode === "grid" 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  : "space-y-2"
              )}>
                {favoriteWorkspaces.map((workspace) => (
                  <WorkspaceCard
                    key={workspace.id}
                    workspace={workspace}
                    viewMode={viewMode}
                    isFavorite={true}
                    onFavoriteToggle={() => toggleFavorite(workspace.id)}
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-4 text-sm font-medium text-zinc-500">
              <Grid className="h-4 w-4" />
              <span>All Workspaces</span>
            </div>
            <div className={cn(
              viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                : "space-y-2"
            )}>
              {nonFavoriteWorkspaces.map((workspace) => (
                <WorkspaceCard
                  key={workspace.id}
                  workspace={workspace}
                  viewMode={viewMode}
                  isFavorite={false}
                  onFavoriteToggle={() => toggleFavorite(workspace.id)}
                />
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

interface WorkspaceCardProps {
  workspace: Workspace & {
    _count: {
      members: number;
      channels: number;
    };
  };
  viewMode: ViewMode;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
}

function WorkspaceCard({ workspace, viewMode, isFavorite, onFavoriteToggle }: WorkspaceCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  if (viewMode === "list") {
    return (
      <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors group">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 flex items-center justify-center bg-zinc-100 dark:bg-zinc-700 rounded-md text-lg font-semibold">
            {workspace.name[0].toUpperCase()}
          </div>
          <div>
            <h3 className="font-medium text-zinc-900 dark:text-zinc-100">{workspace.name}</h3>
            <p className="text-sm text-zinc-500">{workspace._count.members} members · Created {formatDate(workspace.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    onFavoriteToggle();
                  }}
                  className="opacity-0 group-hover:opacity-100"
                >
                  <Star className={cn(
                    "h-4 w-4",
                    isFavorite ? "fill-yellow-400 stroke-yellow-400" : "stroke-zinc-500"
                  )} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isFavorite ? "Remove from favorites" : "Add to favorites"}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Link href={`/workspaces/${workspace.id}`}>
            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Link href={`/workspaces/${workspace.id}`}>
      <div className="p-6 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors group">
        <div className="flex items-center justify-between mb-4">
          <div className="h-12 w-12 flex items-center justify-center bg-zinc-100 dark:bg-zinc-700 rounded-md text-xl font-semibold">
            {workspace.name[0].toUpperCase()}
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    onFavoriteToggle();
                  }}
                  className="opacity-0 group-hover:opacity-100"
                >
                  <Star className={cn(
                    "h-4 w-4",
                    isFavorite ? "fill-yellow-400 stroke-yellow-400" : "stroke-zinc-500"
                  )} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isFavorite ? "Remove from favorites" : "Add to favorites"}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">{workspace.name}</h3>
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <span>{workspace._count.members} members</span>
          <span>·</span>
          <span>{workspace._count.channels} channels</span>
        </div>
        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-700">
          <div className="text-xs text-zinc-500">
            Created {formatDate(workspace.createdAt)}
          </div>
        </div>
      </div>
    </Link>
  );
} 
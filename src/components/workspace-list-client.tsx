"use client";

import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Plus, Users, Hash, Search, Star, Clock, Grid } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Input } from "@/components/ui/input";

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

interface WorkspaceListClientProps {
  workspaces: {
    id: string;
    name: string;
    _count?: {
      members: number;
      channels: number;
    };
  }[];
}

// Workspace Card Component
function WorkspaceCard({ workspace, router }: { workspace: any, router: any }) {
  return (
    <motion.div variants={item}>
      <Card
        className="group relative overflow-hidden border border-border/50 hover:border-indigo-500/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
        onClick={() => router.push(`/workspaces/${workspace.id}`)}
      >
        <div className="p-4">
          {/* Workspace Icon */}
          <div className="mb-3 flex justify-center">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:border-indigo-500/30 transition-colors">
              <p className="font-semibold text-2xl text-indigo-500 group-hover:text-indigo-400 transition-colors">
                {workspace.name[0].toUpperCase()}
              </p>
            </div>
          </div>

          {/* Workspace Info */}
          <div className="text-center">
            <h3 className="font-medium truncate group-hover:text-indigo-500 transition-colors">
              {workspace.name}
            </h3>
            {workspace._count && (
              <p className="text-xs text-muted-foreground mt-1">
                {workspace._count.members} {workspace._count.members === 1 ? "member" : "members"}
              </p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default function WorkspaceListClient({
  workspaces
}: WorkspaceListClientProps) {
  const { onOpen } = useModal();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data for categories (in a real app, these would come from the backend)
  const recentWorkspaces = workspaces.slice(0, 3);
  const favoriteWorkspaces = workspaces.slice(0, 4);

  const filteredWorkspaces = workspaces.filter(workspace =>
    workspace.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Your Workspaces
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Select a workspace to get started or create a new one
          </p>
          <Button
            size="lg"
            onClick={() => onOpen("createWorkspace")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 h-12 rounded-full"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create a Workspace
          </Button>
        </div>

        {/* Search and Filter Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search workspaces..."
            className="pl-10 h-12 bg-background/60 backdrop-blur-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Only show categories if not searching */}
        {!searchQuery && (
          <>
            {/* Recent Section */}
            <section className="mb-12">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-indigo-500" />
                <h2 className="text-lg font-semibold">Recent</h2>
                <span className="text-sm text-muted-foreground">({recentWorkspaces.length})</span>
              </div>
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
              >
                {recentWorkspaces.map((workspace) => (
                  <WorkspaceCard key={workspace.id} workspace={workspace} router={router} />
                ))}
              </motion.div>
            </section>

            {/* Favorites Section */}
            <section className="mb-12">
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-5 w-5 text-yellow-500" />
                <h2 className="text-lg font-semibold">Favorites</h2>
                <span className="text-sm text-muted-foreground">({favoriteWorkspaces.length})</span>
              </div>
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
              >
                {favoriteWorkspaces.map((workspace) => (
                  <WorkspaceCard key={workspace.id} workspace={workspace} router={router} />
                ))}
              </motion.div>
            </section>
          </>
        )}

        {/* All Workspaces Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Grid className="h-5 w-5 text-indigo-500" />
            <h2 className="text-lg font-semibold">
              {searchQuery ? "Search Results" : "All Workspaces"}
            </h2>
            <span className="text-sm text-muted-foreground">({filteredWorkspaces.length})</span>
          </div>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
          >
            {filteredWorkspaces.map((workspace) => (
              <WorkspaceCard key={workspace.id} workspace={workspace} router={router} />
            ))}
          </motion.div>
        </section>
      </div>
    </div>
  );
} 
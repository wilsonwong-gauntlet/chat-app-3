"use client";

import { useState } from "react";
import { Plus, Search, Filter, Grid2X2, List, SortAsc, Clock, FileText, ChevronDown, ChevronUp, Bot } from "lucide-react";
import { Document, User } from "@/types";
import { DocumentUpload } from "@/components/knowledge-base/document-upload";
import { DocumentCard } from "@/components/knowledge-base/document-card";
import { AIChat } from "@/components/knowledge-base/ai-chat";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface KnowledgeBaseClientProps {
  initialDocuments: (Document & {
    user: User;
  })[];
  workspaceId: string;
}

type ViewMode = "grid" | "list";
type SortMode = "recent" | "name" | "type";

export function KnowledgeBaseClient({
  initialDocuments,
  workspaceId
}: KnowledgeBaseClientProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [documents, setDocuments] = useState(initialDocuments);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortMode, setSortMode] = useState<SortMode>("recent");
  const [isAIChatOpen, setIsAIChatOpen] = useState(true);
  
  const handleDocumentUploaded = () => {
    setIsUploadOpen(false);
    // Refresh documents list
    window.location.reload();
  };

  const handleDocumentDeleted = () => {
    window.location.reload();
  };

  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    switch (sortMode) {
      case "recent":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "name":
        return a.name.localeCompare(b.name);
      case "type":
        return a.type.localeCompare(b.type);
      default:
        return 0;
    }
  });

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full p-6 gap-6">
        {/* Documents Section */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Knowledge Base</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {documents.length} document{documents.length !== 1 ? 's' : ''} in workspace
              </p>
            </div>
            <Button onClick={() => setIsUploadOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Upload Document
            </Button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents by name or type..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <SortAsc className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortMode("recent")}>
                  <Clock className="h-4 w-4 mr-2" />
                  Most Recent
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortMode("name")}>
                  <FileText className="h-4 w-4 mr-2" />
                  Name
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortMode("type")}>
                  <Filter className="h-4 w-4 mr-2" />
                  File Type
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            >
              {viewMode === "grid" ? (
                <List className="h-4 w-4" />
              ) : (
                <Grid2X2 className="h-4 w-4" />
              )}
            </Button>
          </div>

          <ScrollArea className="flex-1 -mx-2 px-2">
            <div className={cn(
              "grid gap-4",
              viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            )}>
              {sortedDocuments.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  onDeleted={handleDocumentDeleted}
                  viewMode={viewMode}
                />
              ))}
              {sortedDocuments.length === 0 && searchQuery && (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">No documents match your search.</p>
                </div>
              )}
              {sortedDocuments.length === 0 && !searchQuery && (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">No documents yet. Upload some to get started!</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* AI Chat Section */}
        <Collapsible
          open={isAIChatOpen}
          onOpenChange={setIsAIChatOpen}
          className="border rounded-lg bg-background"
        >
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/5 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-lg font-semibold">Knowledge Assistant</h2>
              </div>
              <Button variant="ghost" size="icon">
                {isAIChatOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Separator />
            <div className="h-[500px]">
              <AIChat workspaceId={workspaceId} />
            </div>
          </CollapsibleContent>
        </Collapsible>

        <DocumentUpload
          workspaceId={workspaceId}
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onUploaded={handleDocumentUploaded}
        />
      </div>
    </TooltipProvider>
  );
} 
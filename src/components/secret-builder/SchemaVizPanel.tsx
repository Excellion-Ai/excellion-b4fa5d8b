import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Send, Loader2, RefreshCw, Copy, Check, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Table {
  name: string;
  columns: Column[];
}

interface Column {
  name: string;
  type: string;
  nullable: boolean;
  isPrimary: boolean;
  isForeign: boolean;
  references?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Sample schema for demo - in production this would come from actual DB introspection
const DEMO_SCHEMA: Table[] = [
  {
    name: 'builder_projects',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, isPrimary: true, isForeign: false },
      { name: 'user_id', type: 'uuid', nullable: true, isPrimary: false, isForeign: false },
      { name: 'name', type: 'text', nullable: false, isPrimary: false, isForeign: false },
      { name: 'idea', type: 'text', nullable: false, isPrimary: false, isForeign: false },
      { name: 'spec', type: 'jsonb', nullable: true, isPrimary: false, isForeign: false },
      { name: 'created_at', type: 'timestamptz', nullable: false, isPrimary: false, isForeign: false },
      { name: 'updated_at', type: 'timestamptz', nullable: false, isPrimary: false, isForeign: false },
      { name: 'published_url', type: 'text', nullable: true, isPrimary: false, isForeign: false },
    ]
  },
  {
    name: 'bookmarks',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, isPrimary: true, isForeign: false },
      { name: 'project_id', type: 'uuid', nullable: false, isPrimary: false, isForeign: true, references: 'builder_projects.id' },
      { name: 'name', type: 'text', nullable: false, isPrimary: false, isForeign: false },
      { name: 'spec', type: 'jsonb', nullable: false, isPrimary: false, isForeign: false },
      { name: 'created_at', type: 'timestamptz', nullable: false, isPrimary: false, isForeign: false },
    ]
  },
  {
    name: 'knowledge_base',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, isPrimary: true, isForeign: false },
      { name: 'project_id', type: 'uuid', nullable: false, isPrimary: false, isForeign: true, references: 'builder_projects.id' },
      { name: 'name', type: 'text', nullable: false, isPrimary: false, isForeign: false },
      { name: 'content', type: 'text', nullable: false, isPrimary: false, isForeign: false },
      { name: 'file_type', type: 'text', nullable: true, isPrimary: false, isForeign: false },
    ]
  },
  {
    name: 'site_analytics',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, isPrimary: true, isForeign: false },
      { name: 'project_id', type: 'uuid', nullable: false, isPrimary: false, isForeign: true, references: 'builder_projects.id' },
      { name: 'page_path', type: 'text', nullable: false, isPrimary: false, isForeign: false },
      { name: 'country', type: 'text', nullable: true, isPrimary: false, isForeign: false },
      { name: 'device_type', type: 'text', nullable: true, isPrimary: false, isForeign: false },
      { name: 'created_at', type: 'timestamptz', nullable: false, isPrimary: false, isForeign: false },
    ]
  },
  {
    name: 'custom_domains',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, isPrimary: true, isForeign: false },
      { name: 'project_id', type: 'uuid', nullable: false, isPrimary: false, isForeign: true, references: 'builder_projects.id' },
      { name: 'domain', type: 'text', nullable: false, isPrimary: false, isForeign: false },
      { name: 'is_verified', type: 'boolean', nullable: false, isPrimary: false, isForeign: false },
      { name: 'ssl_provisioned', type: 'boolean', nullable: false, isPrimary: false, isForeign: false },
    ]
  }
];

const generateMermaidDiagram = (tables: Table[]): string => {
  let diagram = 'erDiagram\n';
  
  // Add tables and their columns
  tables.forEach(table => {
    diagram += `    ${table.name} {\n`;
    table.columns.forEach(col => {
      const pk = col.isPrimary ? 'PK' : '';
      const fk = col.isForeign ? 'FK' : '';
      const marker = pk || fk ? ` ${pk}${fk}` : '';
      diagram += `        ${col.type} ${col.name}${marker}\n`;
    });
    diagram += '    }\n';
  });
  
  // Add relationships
  tables.forEach(table => {
    table.columns.forEach(col => {
      if (col.isForeign && col.references) {
        const [refTable] = col.references.split('.');
        diagram += `    ${refTable} ||--o{ ${table.name} : "has"\n`;
      }
    });
  });
  
  return diagram;
};

const generateSchemaText = (tables: Table[]): string => {
  return tables.map(table => {
    const cols = table.columns.map(c => 
      `  - ${c.name}: ${c.type}${c.nullable ? ' (nullable)' : ''}${c.isPrimary ? ' [PK]' : ''}${c.isForeign ? ` [FK -> ${c.references}]` : ''}`
    ).join('\n');
    return `Table: ${table.name}\n${cols}`;
  }).join('\n\n');
};

export const SchemaVizPanel: React.FC = () => {
  const [tables] = useState<Table[]>(DEMO_SCHEMA);
  const [mermaidCode, setMermaidCode] = useState('');
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMermaidCode(generateMermaidDiagram(tables));
  }, [tables]);

  const handleAskAI = async () => {
    if (!query.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setIsLoading(true);

    try {
      const schemaText = generateSchemaText(tables);
      
      const { data, error } = await supabase.functions.invoke('database-ai', {
        body: { query: query, schema: schemaText }
      });

      if (error) throw error;

      const assistantMessage: Message = { 
        role: 'assistant', 
        content: data.response || 'No response received'
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('AI query error:', error);
      toast.error(error.message || 'Failed to get AI response');
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyMermaid = () => {
    navigator.clipboard.writeText(mermaidCode);
    setCopied(true);
    toast.success('Mermaid code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="diagram" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-4">
          <TabsTrigger value="diagram" className="gap-1.5">
            <Database className="h-3.5 w-3.5" />
            Schema Diagram
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            Ask AI
          </TabsTrigger>
        </TabsList>

        <TabsContent value="diagram" className="flex-1 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">
              Entity Relationship Diagram
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyMermaid}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>

          {/* Mermaid Diagram Preview */}
          <div className="bg-muted/50 rounded-lg p-4 border border-border overflow-auto">
            <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
              {mermaidCode}
            </pre>
          </div>

          {/* Visual representation */}
          <div className="grid grid-cols-2 gap-3">
            {tables.map(table => (
              <div 
                key={table.name}
                className="bg-card border border-border rounded-lg p-3 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">{table.name}</span>
                </div>
                <div className="space-y-1">
                  {table.columns.slice(0, 4).map(col => (
                    <div key={col.name} className="flex items-center gap-2 text-xs">
                      <span className={`w-2 h-2 rounded-full ${col.isPrimary ? 'bg-yellow-500' : col.isForeign ? 'bg-blue-500' : 'bg-muted-foreground/30'}`} />
                      <span className="text-muted-foreground">{col.name}</span>
                      <span className="text-muted-foreground/60 text-[10px]">{col.type}</span>
                    </div>
                  ))}
                  {table.columns.length > 4 && (
                    <p className="text-[10px] text-muted-foreground/50">
                      +{table.columns.length - 4} more columns
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
              Primary Key
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Foreign Key
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ai" className="flex-1 flex flex-col p-4">
          <ScrollArea className="flex-1 mb-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <Database className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    Ask questions about your database schema
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {[
                      "How are the tables related?",
                      "Write a query for analytics",
                      "Suggest indexes for performance"
                    ].map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => setQuery(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-8'
                      : 'bg-muted mr-8'
                  }`}
                >
                  <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                </div>
              ))}
              {isLoading && (
                <div className="bg-muted p-3 rounded-lg mr-8 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about your schema..."
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAskAI()}
              disabled={isLoading}
            />
            <Button onClick={handleAskAI} disabled={!query.trim() || isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

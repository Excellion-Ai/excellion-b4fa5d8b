import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Shield, Users, FileText, Activity, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface QuoteRequest {
  id: string;
  name: string;
  email: string;
  company: string;
  project_type: string;
  budget: string;
  created_at: string;
  user_id: string | null;
  // International WhatsApp fields
  country: string | null;
  whatsapp_raw: string | null;
  whatsapp_e164: string | null;
  // Legacy phone field
  phone: string | null;
  // Additional survey fields
  brand_name: string | null;
  main_outcome: string | null;
  features_needed: string[] | null;
  qualified_plan: string | null;
}

interface AuthActivity {
  id: string;
  email: string;
  event_type: string;
  success: boolean;
  created_at: string;
  ip_address: string | null;
}

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [activity, setActivity] = useState<AuthActivity[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast.error("Access denied. Admin privileges required.");
      navigate("/");
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [quotesRes, activityRes, rolesRes] = await Promise.all([
        supabase
          .from("quote_requests")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("auth_activity")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100),
        supabase
          .from("user_roles")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      if (quotesRes.error) throw quotesRes.error;
      if (activityRes.error) throw activityRes.error;
      if (rolesRes.error) throw rolesRes.error;

      setQuotes(quotesRes.data || []);
      setActivity(activityRes.data || []);
      setUserRoles(rolesRes.data || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleMakeAdmin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: "admin" });

      if (error) throw error;
      toast.success("Admin role granted");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to grant admin role");
    }
  };

  const handleRemoveAdmin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", "admin");

      if (error) throw error;
      toast.success("Admin role removed");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to remove admin role");
    }
  };

  if (adminLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-6 py-24">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
        </div>

        <Tabs defaultValue="quotes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
            <TabsTrigger value="quotes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Quotes
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2" onClick={() => navigate('/admin/courses')}>
              <FileText className="h-4 w-4" />
              Courses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quotes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quote Requests</CardTitle>
                <CardDescription>
                  All quote requests submitted through the survey form
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : quotes.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No quote requests yet
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Country</TableHead>
                          <TableHead>WhatsApp</TableHead>
                          <TableHead>Business</TableHead>
                          <TableHead>Goal</TableHead>
                          <TableHead>Features</TableHead>
                          <TableHead>Plan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {quotes.map((quote) => (
                          <TableRow key={quote.id}>
                            <TableCell className="whitespace-nowrap">
                              {format(new Date(quote.created_at), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell className="font-medium">{quote.name}</TableCell>
                            <TableCell>{quote.email || "—"}</TableCell>
                            <TableCell>{quote.country || "—"}</TableCell>
                            <TableCell className="font-mono text-sm">
                              {quote.whatsapp_e164 ? (
                                <span>{quote.whatsapp_e164}</span>
                              ) : quote.phone ? (
                                <span className="flex items-center gap-2">
                                  <Badge variant="secondary" className="text-xs">legacy</Badge>
                                  {quote.phone}
                                </span>
                              ) : (
                                "—"
                              )}
                            </TableCell>
                            <TableCell>{quote.brand_name || quote.company || "—"}</TableCell>
                            <TableCell>
                              {quote.main_outcome ? (
                                <Badge variant="outline" className="capitalize">
                                  {quote.main_outcome.replace(/-/g, ' ')}
                                </Badge>
                              ) : (
                                "—"
                              )}
                            </TableCell>
                            <TableCell>
                              {quote.features_needed && quote.features_needed.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {quote.features_needed.slice(0, 3).map((feature, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {feature}
                                    </Badge>
                                  ))}
                                  {quote.features_needed.length > 3 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{quote.features_needed.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                "—"
                              )}
                            </TableCell>
                            <TableCell>
                              {quote.qualified_plan ? (
                                <Badge 
                                  variant={
                                    quote.qualified_plan === "Premium" ? "default" :
                                    quote.qualified_plan === "Core" ? "secondary" : "outline"
                                  }
                                >
                                  {quote.qualified_plan}
                                </Badge>
                              ) : (
                                "—"
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Roles</CardTitle>
                <CardDescription>
                  Manage user roles and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : userRoles.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No user roles assigned yet
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User ID</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Assigned</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userRoles.map((role) => (
                          <TableRow key={role.id}>
                            <TableCell className="font-mono text-xs">
                              {role.user_id.slice(0, 8)}...
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={role.role === "admin" ? "default" : "secondary"}
                              >
                                {role.role}
                              </Badge>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {format(new Date(role.created_at), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell>
                              {role.role === "admin" && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleRemoveAdmin(role.user_id)}
                                >
                                  Remove Admin
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Authentication Activity</CardTitle>
                <CardDescription>
                  Recent login attempts and authentication events
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : activity.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No authentication activity yet
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Time</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Event</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>IP Address</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activity.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="whitespace-nowrap">
                              {format(new Date(log.created_at), "MMM d, HH:mm:ss")}
                            </TableCell>
                            <TableCell>{log.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{log.event_type}</Badge>
                            </TableCell>
                            <TableCell>
                              {log.success ? (
                                <Badge variant="default" className="bg-green-500">
                                  Success
                                </Badge>
                              ) : (
                                <Badge variant="destructive">Failed</Badge>
                              )}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {log.ip_address || "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useICP";

const Profile = () => {
    const navigate = useNavigate();
    const { user, loading, error } = useCurrentUser();

    useEffect(() => {
        if (!loading && !user) {
            navigate("/register", { replace: true });
        }
    }, [loading, user, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-muted/30 py-8">
                <div className="container mx-auto px-4">
                    <div className="text-center py-20">Loading your profile...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-muted/30 py-8">
                <div className="container mx-auto px-4">
                    <div className="text-center py-20 text-destructive">{error}</div>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-muted/30 py-8">
            <div className="container mx-auto px-4 max-w-3xl">
                <Card className="shadow-medium">
                    <CardHeader>
                        <CardTitle>My Profile</CardTitle>
                        <CardDescription>Account linked to your ICP principal</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm text-muted-foreground">Display Name</div>
                                <div className="text-lg font-semibold">{user.display_name}</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Email</div>
                                <div className="text-lg">{user.email}</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Role</div>
                                <Badge>
                                    {"Farmer" in user.role ? "Farmer" : "Investor" in user.role ? "Investor" : "Admin" in user.role ? "Admin" : "Guest"}
                                </Badge>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Principal</div>
                                <div className="text-xs break-all">{user.principal.toString()}</div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button onClick={() => navigate("/marketplace")}>Go to Marketplace</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Profile;
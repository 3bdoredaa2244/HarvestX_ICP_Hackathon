import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useRegisterUser } from "@/hooks/useICP";
import { icpService } from "@/services/icpService";

const Register = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { register, loading, error } = useRegisterUser();

    const [form, setForm] = useState({
        display_name: "",
        email: "",
        role: "Farmer",
    });

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const req = {
                display_name: form.display_name,
                email: form.email,
                role: icpService.convertUserRole(form.role),
            };
            const user = await register(req as any);
            if (user) {
                toast({ title: "Welcome to HarvestX!", description: "Profile created successfully." });
                navigate("/profile", { replace: true });
            }
        } catch (err) {
            toast({ title: "Registration failed", description: error || "Please try again.", variant: "destructive" });
        }
    };

    return (
        <div className="min-h-screen bg-muted/30 py-8">
            <div className="container mx-auto px-4 max-w-lg">
                <Card className="shadow-medium">
                    <CardHeader>
                        <CardTitle>Create your HarvestX profile</CardTitle>
                        <CardDescription>Register to access your dashboard and invest or list crops</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={onSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="display_name">Display name</Label>
                                <Input id="display_name" value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Role</Label>
                                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Farmer">Farmer</SelectItem>
                                        <SelectItem value="Investor">Investor</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Creating..." : "Create Profile"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Register;
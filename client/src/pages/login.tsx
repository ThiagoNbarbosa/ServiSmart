import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "wouter";
import { Eye, EyeOff, Shield, User } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError("");
    
    try {
      // Simulate login - redirect to Replit Auth
      window.location.href = "/api/login";
    } catch (err) {
      setError("Erro ao fazer login. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto h-12 w-20 flex items-center justify-center mb-4">
              <svg viewBox="0 0 100 60" className="h-full w-full">
                <path d="M10 50 L25 10 L40 35 L55 10 L70 50" stroke="#B91C1C" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M30 50 L45 10 L60 35 L75 10 L90 50" stroke="#374151" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">MAFFENG</CardTitle>
            <p className="text-gray-600">Sistema de Gestão de OS Preventiva</p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            {...field}
                            type="email"
                            placeholder="seu@email.com"
                            className="pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-10 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff /> : <Eye />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Link href="/forgot-password">
                    <Button type="button" variant="link" className="p-0 h-auto text-sm">
                      Esqueceu a senha?
                    </Button>
                  </Link>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>

                <div className="text-center pt-4">
                  <p className="text-sm text-gray-600">
                    Não tem uma conta?{" "}
                    <Link href="/register">
                      <Button type="button" variant="link" className="p-0 h-auto">
                        Cadastre-se
                      </Button>
                    </Link>
                  </p>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Sistema desenvolvido pela MAFFENG Engineering
          </p>
        </div>
      </div>
    </div>
  );
}
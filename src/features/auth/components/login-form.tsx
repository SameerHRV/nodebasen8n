"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormLabel,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ClockFading } from "lucide-react";
import { authClient } from "@/lib/auth-client";
// import {authClient} from "@/lib/auth-client";

const loginSchema = z.object({
  email: z.email().min(1, "Email is required"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

type LoginFromValues = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const router = useRouter();

  const from = useForm<LoginFromValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (data: LoginFromValues) => {
    await authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          router.push("/");
        },
        onError: (error) => {
          toast.error(error.error.message);
        },
      }
    );
  };

  const isPending = from.formState.isSubmitting;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>Login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...from}>
            <form onSubmit={from.handleSubmit(handleSubmit)}>
              <div className="grid gap-6">
                <div className="flex flex-col gap-4">
                  <Button
                    variant={"outline"}
                    className="w-full"
                    type="button"
                    disabled={isPending}
                  >
                    <Image
                      src={"/images/github.svg"}
                      width={20}
                      height={20}
                      alt="github"
                    />
                    Continue with GitHub
                  </Button>
                  <Button
                    variant={"outline"}
                    className="w-full"
                    type="button"
                    disabled={isPending}
                  >
                    <Image
                      src={"/images/google.svg"}
                      width={20}
                      height={20}
                      alt="google"
                    />
                    Continue with Google
                  </Button>
                </div>
                <div className="grid gap-6">
                  <FormField
                    control={from.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="m@example.com"
                            required
                            className=""
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={from.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="***************"
                            required
                            className=""
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isPending}>
                    Login
                  </Button>
                </div>
                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link
                    className="underline underline-offset-4"
                    href="/register"
                  >
                    Register
                  </Link>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;

"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
// import {authClient} from "@/lib/auth-client";

const RegisterSchema = z
  .object({
    email: z.email().min(1, "Email is required"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFromValues = z.infer<typeof RegisterSchema>;

const RegisterForm = () => {
  const router = useRouter();

  const from = useForm<RegisterFromValues>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleGithubSignIn = async () => {
    await authClient.signIn.social(
      {
        provider: "github",
      },
      {
        onSuccess: () => {
          router.push("/");
          toast.success("Signed in successfully");
        },
        onError: (error) => {
          toast.error(error.error.message);
        },
      },
    );
  };
  const handleGoogleSignIn = async () => {
    await authClient.signIn.social(
      {
        provider: "google",
      },
      {
        onSuccess: () => {
          router.push("/");
          toast.success("Signed in successfully");
        },
        onError: (error) => {
          toast.error(error.error.message);
        },
      },
    );
  };

  const handleSubmit = async (data: RegisterFromValues) => {
    await authClient.signUp.email(
      {
        name: data.email,
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
      },
    );
  };

  const isPending = from.formState.isSubmitting;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Get started with your account</CardTitle>
          <CardDescription>Register to your account</CardDescription>
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
                    onClick={handleGithubSignIn}
                  >
                    <Image
                      src={"github.svg"}
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
                    onClick={handleGoogleSignIn}
                  >
                    <Image
                      src={"google.svg"}
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
                  <FormField
                    control={from.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
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
                    Register
                  </Button>
                </div>
                <div className="text-center text-sm">
                  Already have a account?{" "}
                  <Link className="underline underline-offset-4" href="/login">
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

export default RegisterForm;

import { Button } from "@/app/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-background sticky top-0 z-30">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2 font-bold text-xl">
            <span className="text-primary">Video Conference App</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/register">Register</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container flex flex-col items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Virtual meetings made simple
              </h1>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join or host meetings with high-quality video and audio, screen sharing, and real-time chat.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button asChild size="lg">
                <Link href="/auth/register">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/dashboard">View Demo</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-3">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Features</h2>
              <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Everything you need for seamless video conferencing
              </p>
            </div>
            <div className="lg:col-span-2 grid gap-4 md:grid-cols-2">
              <div className="bg-background p-6 rounded-lg border shadow-sm">
                <h3 className="text-xl font-bold">HD Video & Audio</h3>
                <p className="text-muted-foreground">
                  Crystal clear communication with high-definition video and audio.
                </p>
              </div>
              <div className="bg-background p-6 rounded-lg border shadow-sm">
                <h3 className="text-xl font-bold">Screen Sharing</h3>
                <p className="text-muted-foreground">
                  Present documents, slides, and more with easy screen sharing.
                </p>
              </div>
              <div className="bg-background p-6 rounded-lg border shadow-sm">
                <h3 className="text-xl font-bold">Real-time Chat</h3>
                <p className="text-muted-foreground">
                  Share links and communicate via text during your meetings.
                </p>
              </div>
              <div className="bg-background p-6 rounded-lg border shadow-sm">
                <h3 className="text-xl font-bold">Recording</h3>
                <p className="text-muted-foreground">
                  Record your meetings for later reference and sharing.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Video Conference App. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
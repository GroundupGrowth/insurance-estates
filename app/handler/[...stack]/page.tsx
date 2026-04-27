import { StackHandler } from "@stackframe/stack";
import { stackServerApp } from "@/stack";

export default function Handler(props: unknown) {
  return (
    <StackHandler
      fullPage
      app={stackServerApp}
      routeProps={props as Parameters<typeof StackHandler>[0]["routeProps"]}
    />
  );
}

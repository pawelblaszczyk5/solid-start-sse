import { createEffect, onCleanup } from "solid-js";

export const createEventStream = (
  { url }: { url: string },
  onMessage: (event: MessageEvent) => void
) => {
  createEffect(() => {
    const eventSource = new EventSource(url);

    eventSource.addEventListener("example", (event) => {
      onMessage(event);
    });

    onCleanup(() => eventSource.close());
  });
};

import { createSignal } from "solid-js";
import { Title } from "solid-start";
import server$ from "solid-start/server";
import { createEventStream } from "~/utils/createEventStream";

interface SendFunctionArgs {
  /**
   * @default "message"
   */
  event?: string;
  data: string;
}

interface SendFunction {
  (args: SendFunctionArgs): void;
}

interface CleanupFunction {
  (): void;
}

interface InitFunction {
  (send: SendFunction): CleanupFunction;
}

/**
 * A response holper to use Server Sent Events server-side
 * @param signal The AbortSignal used to close the stream
 * @param init The function that will be called to initialize the stream, here you can subscribe to your events
 * @returns A Response object that can be returned from a loader
 */
export function eventStream(signal: AbortSignal, init: InitFunction) {
  let stream = new ReadableStream({
    start(controller) {
      let encoder = new TextEncoder();

      function send({ event = "message", data }: SendFunctionArgs) {
        controller.enqueue(encoder.encode(`event: ${event}\n`));
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      }

      let cleanup = init(send);

      let closed = false;

      function close() {
        if (closed) return;
        cleanup();
        closed = true;
        signal.removeEventListener("abort", close);
        controller.close();
      }

      signal.addEventListener("abort", close);

      if (signal.aborted) return close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export default function Home() {
  const [data, setData] = createSignal("");
  createEventStream(
    server$(async () =>
      eventStream(server$.request.signal, (send) => {
        const interval = setInterval(() => {
          send({
            data: new Date().toLocaleTimeString("en", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
          });
        }, 1000);

        return () => {
          console.log("cleanup");
          clearInterval(interval);
        };
      })
    ),
    (event) => {
      setData(event.data);
    }
  );

  return (
    <main>
      <Title>Hello World</Title>
      <h1>Hello world!</h1>
      <p>{data()}</p>
    </main>
  );
}

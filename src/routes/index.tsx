import { Title } from "solid-start";
import server$, { eventStream } from "solid-start/server";
import { createEventStream } from "~/utils/createEventStream";

export default function Home() {
  createEventStream(
    server$(async () =>
      eventStream(server$.request, (send) => {
        send("example", "test");

        return () => {
          console.log("closed");
        };
      })
    ),
    (event) => {
      console.log(event);
    }
  );

  return (
    <main>
      <Title>Hello World</Title>
      <h1>Hello world!</h1>
    </main>
  );
}

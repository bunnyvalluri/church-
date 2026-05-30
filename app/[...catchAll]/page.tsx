import NotFound from "../not-found";

export default function CatchAllPage() {
  // This catch-all page intercepts all non-matching routes and renders the NotFound component
  // but since it's a matched page, it returns HTTP 200 OK to the client.
  return <NotFound />;
}

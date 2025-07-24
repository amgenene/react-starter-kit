# React Router v7 Routing Guide

This comprehensive guide covers React Router v7 routing patterns, redirect functionality, file-based routing, and best practices for this React Starter Kit project.

## Table of Contents

1. [Route Configuration Patterns](#route-configuration-patterns)
2. [File-Based vs Configuration-Based Routing](#file-based-vs-configuration-based-routing)
3. [Route Discovery and Automatic Loading](#route-discovery-and-automatic-loading)
4. [Redirect Functionality](#redirect-functionality)
5. [Data Loading with Loaders](#data-loading-with-loaders)
6. [Route Parameters](#route-parameters)
7. [Navigation and Programmatic Routing](#navigation-and-programmatic-routing)
8. [Layout Routes and Nested Routing](#layout-routes-and-nested-routing)
9. [Project-Specific Patterns](#project-specific-patterns)
10. [Best Practices](#best-practices)

## Route Configuration Patterns

### Configuration-Based Routing (Current Project Setup)

Your project uses configuration-based routing defined in `app/routes.ts`. Each route requires two parts:
- **URL Pattern**: The path segment that matches the URL
- **Route Module**: The file that contains the route's logic and UI

```typescript
import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("sign-in/*", "routes/sign-in.tsx"),
  route("sign-up/*", "routes/sign-up.tsx"),
  route("pricing", "routes/pricing.tsx"),
  route("success", "routes/success.tsx"),
  route("subscription-required", "routes/subscription-required.tsx"),
  layout("routes/dashboard/layout.tsx", [
    route("dashboard", "routes/dashboard/index.tsx"),
    route("dashboard/chat", "routes/dashboard/chat.tsx"),
    route("dashboard/settings", "routes/dashboard/settings.tsx"),
  ]),
] satisfies RouteConfig;
```

### Advanced Configuration Patterns

React Router v7 supports complex routing structures:

```typescript
export default [
  // Index route
  index("./home.tsx"),
  
  // Simple routes
  route("about", "./about.tsx"),
  
  // Layout with nested routes
  layout("./auth/layout.tsx", [
    route("login", "./auth/login.tsx"),
    route("register", "./auth/register.tsx"),
  ]),
  
  // Route groups with prefix
  ...prefix("concerts", [
    index("./concerts/home.tsx"),
    route(":city", "./concerts/city.tsx"),
    route("trending", "./concerts/trending.tsx"),
  ]),
] satisfies RouteConfig;
```

## File-Based vs Configuration-Based Routing

### Configuration-Based Routing (Recommended for Complex Apps)

**Advantages:**
- Explicit route definitions
- Better for complex routing logic
- Easier to understand routing structure at a glance
- Better TypeScript integration
- More control over route behavior

**Current Project Structure:**
```
app/
├── routes.ts              # Route configuration
└── routes/
    ├── home.tsx          # Index route
    ├── pricing.tsx       # Simple route
    ├── sign-in.tsx       # Auth route
    ├── sign-up.tsx       # Auth route
    └── dashboard/
        ├── layout.tsx    # Layout route
        ├── index.tsx     # Dashboard home
        ├── chat.tsx      # Chat route
        └── settings.tsx  # Settings route
```

### File-Based Routing (Alternative)

For projects preferring file-system conventions, use `@react-router/fs-routes`:

```bash
npm install @react-router/fs-routes
```

```typescript
// react-router.config.ts
import { flatRoutes } from "@react-router/fs-routes";

export default {
  routes: flatRoutes(),
} satisfies Config;
```

**File-system conventions:**
```
app/routes/
├── _index.tsx              # / (index route)
├── about.tsx               # /about
├── concerts._index.tsx     # /concerts
├── concerts.$city.tsx      # /concerts/:city
├── concerts.trending.tsx   # /concerts/trending
└── dashboard/
    ├── _layout.tsx         # Layout for dashboard routes
    ├── _index.tsx          # /dashboard
    └── settings.tsx        # /dashboard/settings
```

## Route Discovery and Automatic Loading

### Lazy Route Discovery (Fog of War)

React Router v7 introduces **Lazy Route Discovery** for performance optimization:

```typescript
// react-router.config.ts
export default {
  routeDiscovery: {
    enabled: true,           // Enable/disable feature
    manifestPath: "/__manifest", // Configure manifest endpoint
  },
} satisfies Config;
```

**Benefits:**
- Routes are discovered and loaded on-demand
- Reduces initial bundle size
- Improves performance for large applications
- Automatically handles code splitting

**Configuration Options:**
- `enabled: boolean` - Toggle lazy route discovery
- `manifestPath: string` - Custom manifest endpoint path

## Redirect Functionality

### Server-Side Redirects (Preferred)

React Router v7 provides the `redirect` function for server-side redirects. This is the preferred method as it happens before the page renders:

```typescript
import { redirect } from "react-router";

// In a route loader (server-side)
export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);

  // Redirect unauthenticated users
  if (!userId) {
    throw redirect("/sign-in");
  }

  // Conditional redirect based on subscription status
  const subscriptionStatus = await fetchQuery(api.subscriptions.checkUserSubscriptionStatus, { userId });
  if (!subscriptionStatus?.hasActiveSubscription) {
    throw redirect("/subscription-required");
  }

  return { user };
}
```

**Example from your project** (`app/routes/dashboard/layout.tsx`):
```typescript
export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);

  // Redirect to sign-in if not authenticated
  if (!userId) {
    throw redirect("/sign-in");
  }

  // Redirect to subscription-required if no active subscription
  if (!subscriptionStatus?.hasActiveSubscription) {
    throw redirect("/subscription-required");
  }

  return { user };
}
```

### Client-Side Navigation

For programmatic navigation on the client side, use `useNavigate`:

```typescript
import { useNavigate } from "react-router";

function MyComponent() {
  const navigate = useNavigate();

  const handleSignupSuccess = () => {
    // Navigate after signup
    navigate("/waitlist-success");
  };

  return <button onClick={handleSignupSuccess}>Sign Up</button>;
}
```

**Example from your project** (`app/routes/sign-up.tsx`):
```typescript
export default function SignUpPage() {
  const navigate = useNavigate();
  const upsertUser = useMutation(api.users.upsertUser);

  useEffect(() => {
    if (isSignedIn) {
      upsertUser()
        .then(() => {
          // Redirect to success page after successful signup
          navigate("/waitlist-success");
        })
        .catch(console.error);
    }
  }, [isSignedIn, upsertUser, navigate]);
}
```

### Declarative Navigation

For conditional rendering based on state, use the `Navigate` component:

```typescript
import { Navigate } from "react-router";

function ProtectedRoute({ user, children }) {
  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }
  
  return children;
}
```

## Common Routing Tasks in This Project

### Adding a New Route

1. **Create the route file**: `app/routes/my-new-route.tsx`
2. **Add to routes configuration**: Update `app/routes.ts`

```typescript
export default [
  // ... existing routes
  route("my-new-route", "routes/my-new-route.tsx"),
] satisfies RouteConfig;
```

3. **Basic route structure**:
```typescript
import type { Route } from "./+types/my-new-route";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "My New Route" },
    { name: "description", content: "Description here" },
  ];
}

export async function loader(args: Route.LoaderArgs) {
  // Server-side data loading
  return { data: "example" };
}

export default function MyNewRoute({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <h1>My New Route</h1>
      <p>Data: {loaderData.data}</p>
    </div>
  );
}
```

### Protected Routes Pattern

For routes requiring authentication:

```typescript
export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);
  
  if (!userId) {
    throw redirect("/sign-in");
  }
  
  return { userId };
}
```

### Subscription-Gated Routes Pattern

For routes requiring active subscription:

```typescript
export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);
  
  if (!userId) {
    throw redirect("/sign-in");
  }
  
  const subscriptionStatus = await fetchQuery(
    api.subscriptions.checkUserSubscriptionStatus, 
    { userId }
  );
  
  if (!subscriptionStatus?.hasActiveSubscription) {
    throw redirect("/subscription-required");
  }
  
  return { userId };
}
```

### Navigation Between Routes

```typescript
import { Link, useNavigate } from "react-router";

// Declarative navigation
<Link to="/dashboard">Go to Dashboard</Link>

// Programmatic navigation
const navigate = useNavigate();
navigate("/success");
```

## Best Practices Summary

```typescript
import { redirect } from "react-router";
import type { Route } from "./+types/layout";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUser(request);
  
  // Redirect unauthenticated users
  if (!user) {
    throw redirect("/sign-in");
  }
  
  // Conditional redirects
  if (!user.hasActiveSubscription) {
    throw redirect("/subscription-required");
  }
  
  return { user };
}
```

**Your Project Example** (from `dashboard/layout.tsx`):
```typescript
export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);

  // Redirect to sign-in if not authenticated
  if (!userId) {
    throw redirect("/sign-in");
  }

  const [subscriptionStatus, user] = await Promise.all([
    fetchQuery(api.subscriptions.checkUserSubscriptionStatus, { userId }),
    createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    }).users.getUser(userId)
  ]);

  // Redirect to subscription-required if no active subscription
  if (!subscriptionStatus?.hasActiveSubscription) {
    throw redirect("/subscription-required");
  }

  return { user };
}
```

### Client-Side Redirects with Navigate Component

**Declarative redirects** using the `Navigate` component:

```typescript
import { Navigate } from "react-router";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }
  
  return children;
}
```

### Programmatic Navigation with useNavigate

**Imperative navigation** for user interactions:

```typescript
import { useNavigate } from "react-router";

function LoginForm() {
  const navigate = useNavigate();
  
  const handleLogin = async (credentials) => {
    await login(credentials);
    navigate("/dashboard", { replace: true });
  };
  
  const goBack = () => {
    navigate(-1); // Go back in history
  };
  
  return (
    <form onSubmit={handleLogin}>
      {/* form content */}
      <button type="button" onClick={goBack}>Back</button>
    </form>
  );
}
```

## Data Loading with Loaders

### Server-Side Loaders

**Primary data loading** happens in loader functions:

```typescript
import type { Route } from "./+types/dashboard";

export async function loader({ params, request }: Route.LoaderArgs) {
  // Access route parameters
  const userId = params.userId;
  
  // Access request information
  const url = new URL(request.url);
  const searchParam = url.searchParams.get("query");
  
  // Parallel data fetching
  const [user, posts] = await Promise.all([
    fetchUser(userId),
    fetchUserPosts(userId, searchParam)
  ]);
  
  return { user, posts };
}

export default function Dashboard() {
  const { user, posts } = useLoaderData<typeof loader>();
  
  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      {/* render posts */}
    </div>
  );
}
```

### Client-Side Loaders

**Additional client-side data loading**:

```typescript
export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  // Client-only data fetching
  const clientData = await fetchClientSpecificData(params.id);
  return { clientData };
}

// Optional loading fallback during hydration
export function HydrateFallback() {
  return <div>Loading dashboard...</div>;
}
```

### Loading States

**Handle loading states** with `useNavigation`:

```typescript
import { useNavigation } from "react-router";

export default function App() {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";
  
  return (
    <div>
      {isLoading && <div>Loading...</div>}
      <Outlet />
    </div>
  );
}
```

## Route Parameters

### Dynamic Route Parameters

**URL parameters** are accessible through the `params` object:

```typescript
// Route: "products/:productId/reviews/:reviewId"
export async function loader({ params }: Route.LoaderArgs) {
  const { productId, reviewId } = params;
  
  const [product, review] = await Promise.all([
    fetchProduct(productId),
    fetchReview(reviewId)
  ]);
  
  return { product, review };
}
```

### Splat Parameters

**Wildcard routes** for catching multiple segments:

```typescript
// Route: "files/*"
export async function loader({ params }: Route.LoaderArgs) {
  const filePath = params["*"]; // Everything after "files/"
  const file = await fetchFile(filePath);
  return { file };
}
```

### Search Parameters

**Query parameters** via `request.url`:

```typescript
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q");
  const page = parseInt(url.searchParams.get("page") || "1");
  
  const results = await searchProducts(query, page);
  return { results, query, page };
}
```

## Navigation and Programmatic Routing

### useNavigate Hook Options

```typescript
import { useNavigate } from "react-router";

function NavigationExample() {
  const navigate = useNavigate();
  
  // Basic navigation
  const goToProfile = () => navigate("/profile");
  
  // Navigation with replace (no history entry)
  const redirectToHome = () => navigate("/", { replace: true });
  
  // Navigation with state
  const goToEdit = () => navigate("/edit", { state: { from: "dashboard" } });
  
  // Relative navigation
  const goToSubpage = () => navigate("./subpage");
  const goUp = () => navigate("..");
  
  // History navigation
  const goBack = () => navigate(-1);
  const goForward = () => navigate(1);
  
  return <div>{/* navigation buttons */}</div>;
}
```

### Link Components

**Declarative navigation** with Link components:

```typescript
import { Link, NavLink } from "react-router";

function Navigation() {
  return (
    <nav>
      {/* Basic link */}
      <Link to="/dashboard">Dashboard</Link>
      
      {/* Link with state */}
      <Link to="/profile" state={{ from: "nav" }}>Profile</Link>
      
      {/* NavLink with active styling */}
      <NavLink 
        to="/settings" 
        className={({ isActive }) => isActive ? "active" : ""}
      >
        Settings
      </NavLink>
      
      {/* Prefetch link for performance */}
      <Link to="/heavy-page" prefetch="intent">Heavy Page</Link>
    </nav>
  );
}
```

## Layout Routes and Nested Routing

### Layout Route Pattern

**Your project's dashboard layout example**:

```typescript
// routes/dashboard/layout.tsx
export async function loader(args: Route.LoaderArgs) {
  // Authentication and data loading
  const { userId } = await getAuth(args);
  if (!userId) throw redirect("/sign-in");
  
  return { user };
}

export default function DashboardLayout() {
  const { user } = useLoaderData();
  
  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <SiteHeader />
        <Outlet /> {/* Child routes render here */}
      </SidebarInset>
    </SidebarProvider>
  );
}
```

### Nested Route Configuration

```typescript
export default [
  layout("routes/dashboard/layout.tsx", [
    route("dashboard", "routes/dashboard/index.tsx"),       # /dashboard
    route("dashboard/chat", "routes/dashboard/chat.tsx"),   # /dashboard/chat
    route("dashboard/settings", "routes/dashboard/settings.tsx"), # /dashboard/settings
  ]),
] satisfies RouteConfig;
```

### Multiple Layout Levels

```typescript
export default [
  layout("./root-layout.tsx", [
    layout("./auth-layout.tsx", [
      route("login", "./login.tsx"),
      route("register", "./register.tsx"),
    ]),
    layout("./dashboard-layout.tsx", [
      route("dashboard", "./dashboard/index.tsx"),
      route("dashboard/users", "./dashboard/users.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
```

## Project-Specific Patterns

### Authentication Flow

**Your project's auth pattern**:

1. **Route Protection in Layout Loader**:
   ```typescript
   // dashboard/layout.tsx loader
   if (!userId) throw redirect("/sign-in");
   ```

2. **Subscription Check**:
   ```typescript
   if (!subscriptionStatus?.hasActiveSubscription) {
     throw redirect("/subscription-required");
   }
   ```

3. **Auth Routes with Wildcard**:
   ```typescript
   route("sign-in/*", "routes/sign-in.tsx"),
   route("sign-up/*", "routes/sign-up.tsx"),
   ```

### Pricing and Checkout Flow

**Client-side navigation** for external redirects:

```typescript
// From pricing.tsx
const handleSubscribe = async (priceId: string) => {
  if (!isSignedIn) {
    window.location.href = "/sign-in"; // Full page redirect
    return;
  }
  
  const checkoutUrl = await createCheckout({ priceId });
  window.location.href = checkoutUrl; // External redirect
};
```

### Data Synchronization

**User sync pattern** with effects:

```typescript
React.useEffect(() => {
  if (isSignedIn) {
    upsertUser().catch(console.error);
  }
}, [isSignedIn, upsertUser]);
```

## Best Practices

### 1. Route Organization

**Recommended structure**:
```
app/routes/
├── (public)/              # Public routes
│   ├── home.tsx
│   ├── pricing.tsx
│   └── about.tsx
├── (auth)/                # Authentication routes
│   ├── sign-in.tsx
│   └── sign-up.tsx
└── dashboard/             # Protected routes
    ├── layout.tsx
    ├── index.tsx
    ├── chat.tsx
    └── settings.tsx
```

### 2. Data Loading Best Practices

- **Use loaders for initial data**: Load critical data in server-side loaders
- **Parallel data fetching**: Use `Promise.all()` to avoid waterfalls
- **Handle loading states**: Use `useNavigation` for global loading indicators
- **Type safety**: Use `typeof loader` for `useLoaderData` typing

```typescript
export async function loader({ params }: Route.LoaderArgs) {
  // Good: Parallel loading
  const [user, settings] = await Promise.all([
    fetchUser(params.userId),
    fetchUserSettings(params.userId)
  ]);
  
  return { user, settings };
}

export default function Settings() {
  // Good: Typed loader data
  const { user, settings } = useLoaderData<typeof loader>();
  return <div>{/* component */}</div>;
}
```

### 3. Redirect Patterns

- **Server-side redirects**: Use `redirect()` in loaders for authentication
- **Client-side navigation**: Use `useNavigate` for user interactions
- **External redirects**: Use `window.location.href` for external URLs
- **Conditional redirects**: Handle multiple redirect scenarios in loaders

### 4. Route Configuration

- **Explicit is better**: Use configuration-based routing for complex apps
- **Group related routes**: Use layouts and prefixes for organization
- **Consistent naming**: Use clear, descriptive route names
- **TypeScript first**: Leverage TypeScript for route type safety

### 5. Performance Optimization

- **Lazy route discovery**: Enable for large applications
- **Prefetch strategic routes**: Use `prefetch="intent"` on important links
- **Code splitting**: Leverage automatic code splitting with loaders
- **Minimize loader work**: Only fetch essential data in loaders

### 6. Error Handling

```typescript
export async function loader() {
  try {
    const data = await fetchData();
    return data;
  } catch (error) {
    // Handle specific errors
    if (error.status === 404) {
      throw new Response("Not Found", { status: 404 });
    }
    throw error;
  }
}

// Error boundary component
export function ErrorBoundary() {
  const error = useRouteError();
  
  if (isRouteErrorResponse(error)) {
    return <div>Error {error.status}: {error.data}</div>;
  }
  
  return <div>Unexpected error occurred</div>;
}
```

This guide provides comprehensive coverage of React Router v7 patterns used in your project and best practices for future routing work. The examples are based on your current implementation and modern React Router v7 conventions from 2025.
import type { CanvasNode, CanvasEdge, NodeData } from "@/types/canvas";
import { NODE_COLORS } from "@/types/canvas";

export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

let templateCounter = 0;
function nodeId(): string {
  return `tpl-${templateCounter++}`;
}

function node(
  x: number,
  y: number,
  shape: NodeData["shape"],
  label: string,
  colorIndex: number,
  width?: number,
  height?: number,
): CanvasNode {
  const c = NODE_COLORS[colorIndex] ?? NODE_COLORS[0];
  const sizes: Record<string, { width: number; height: number }> = {
    rectangle: { width: 200, height: 100 },
    diamond: { width: 180, height: 180 },
    circle: { width: 150, height: 150 },
    pill: { width: 180, height: 90 },
    cylinder: { width: 150, height: 180 },
    hexagon: { width: 160, height: 140 },
  };
  const s = sizes[shape] ?? sizes.rectangle;
  return {
    id: nodeId(),
    type: "canvasNode",
    position: { x, y },
    data: {
      label,
      color: c.fill,
      textColor: c.text,
      shape,
      width: width ?? s.width,
      height: height ?? s.height,
    },
  };
}

function edge(source: string, target: string, label?: string): CanvasEdge {
  return {
    id: `e-${source}-${target}`,
    source,
    target,
    type: "canvasEdge",
    data: label ? { label } : undefined,
  };
}

const microservices: CanvasTemplate = (() => {
  const client = node(300, 0, "hexagon", "Client", 0);
  const gateway = node(300, 160, "pill", "API Gateway", 1);
  const auth = node(40, 340, "pill", "Auth Service", 2);
  const users = node(260, 340, "pill", "User Service", 3);
  const orders = node(480, 340, "pill", "Order Service", 4);
  const inventory = node(260, 520, "rectangle", "Inventory DB", 7, 150, 120);
  const usersDb = node(40, 520, "cylinder", "Users DB", 7);
  const ordersDb = node(480, 520, "cylinder", "Orders DB", 7);
  const queue = node(400, 520, "diamond", "Event Bus", 5);

  return {
    id: "microservices",
    name: "Microservices",
    description:
      "API Gateway routes traffic to isolated services, each backed by a dedicated database and connected via a shared message bus.",
    nodes: [client, gateway, auth, users, orders, inventory, usersDb, ordersDb, queue],
    edges: [
      edge(client.id, gateway.id),
      edge(gateway.id, auth.id),
      edge(gateway.id, users.id),
      edge(gateway.id, orders.id),
      edge(auth.id, usersDb.id),
      edge(users.id, inventory.id),
      edge(orders.id, ordersDb.id),
      edge(orders.id, queue.id, "publish"),
      edge(queue.id, inventory.id, "consume"),
    ],
  };
})();

const cicd: CanvasTemplate = (() => {
  const repo = node(300, 0, "hexagon", "Source Repo", 0);
  const trigger = node(300, 160, "circle", "CI Trigger", 5);
  const build = node(300, 320, "pill", "Build", 1);
  const test = node(80, 480, "pill", "Unit Tests", 3);
  const lint = node(300, 480, "pill", "Lint & Type Check", 4);
  const security = node(520, 480, "pill", "Security Scan", 2);
  const approval = node(300, 660, "diamond", "Approval Gate", 6);
  const staging = node(140, 840, "rectangle", "Deploy Staging", 7, 180, 100);
  const prod = node(460, 840, "rectangle", "Deploy Production", 7, 180, 100);
  const monitor = node(300, 1020, "circle", "Monitoring", 5);

  return {
    id: "cicd-pipeline",
    name: "CI/CD Pipeline",
    description:
      "End-to-end delivery from source commit through build, test, containerisation, and staged deployment to production.",
    nodes: [repo, trigger, build, test, lint, security, approval, staging, prod, monitor],
    edges: [
      edge(repo.id, trigger.id, "push"),
      edge(trigger.id, build.id),
      edge(build.id, test.id),
      edge(build.id, lint.id),
      edge(build.id, security.id),
      edge(test.id, approval.id),
      edge(lint.id, approval.id),
      edge(security.id, approval.id),
      edge(approval.id, staging.id, "approve"),
      edge(staging.id, prod.id, "promote"),
      edge(prod.id, monitor.id),
    ],
  };
})();

const eventDriven: CanvasTemplate = (() => {
  const api = node(300, 0, "pill", "HTTP API", 1);
  const auth = node(80, 180, "circle", "Auth", 2);
  const orderSvc = node(300, 180, "pill", "Order Service", 3);
  const paymentSvc = node(520, 180, "pill", "Payment Service", 4);
  const eventBus = node(300, 380, "diamond", "Event Bus", 5);
  const notifSvc = node(80, 560, "rectangle", "Notification Service", 6, 200, 100);
  const analytics = node(300, 560, "rectangle", "Analytics Worker", 7, 200, 100);
  const inventorySvc = node(520, 560, "pill", "Inventory Service", 0);
  const orderDb = node(300, 740, "cylinder", "Orders DB", 7);
  const inventoryDb = node(520, 740, "cylinder", "Inventory DB", 7);

  return {
    id: "event-driven",
    name: "Event-Driven System",
    description:
      "Producers publish events to a central bus. Independent consumers handle emails, push notifications, analytics, and error queues.",
    nodes: [api, auth, orderSvc, paymentSvc, eventBus, notifSvc, analytics, inventorySvc, orderDb, inventoryDb],
    edges: [
      edge(api.id, auth.id),
      edge(api.id, orderSvc.id),
      edge(api.id, paymentSvc.id),
      edge(orderSvc.id, eventBus.id, "OrderCreated"),
      edge(paymentSvc.id, eventBus.id, "PaymentProcessed"),
      edge(eventBus.id, notifSvc.id, "OrderCreated"),
      edge(eventBus.id, analytics.id, "PaymentProcessed"),
      edge(eventBus.id, inventorySvc.id, "OrderCreated"),
      edge(orderSvc.id, orderDb.id),
      edge(inventorySvc.id, inventoryDb.id),
    ],
  };
})();

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  microservices,
  cicd,
  eventDriven,
];

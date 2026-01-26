"use client";

import { GlobeIcon, MousePointerIcon } from "lucide-react";
import { NodeType } from "@/generated/prisma/enums";
import { createId } from "@paralleldrive/cuid2";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { Separator } from "../ui/separator";
import { useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import { toast } from "sonner";
import Image from "next/image";

export type NodeTypeOption = {
  type: NodeType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }> | string;
};

const triggerNodes: NodeTypeOption[] = [
  {
    type: NodeType.MANUAL_TRIGGER,
    label: "Manual Trigger",
    description: "Manual Trigger",
    icon: MousePointerIcon,
  },
  {
    type: NodeType.GOOGLE_FORM_TRIGGER,
    label: "Google Form Trigger",
    description: "Google Form Trigger",
    icon: "/googleform.svg",
  },
  {
    type: NodeType.STRIPE_TRIGGER,
    label: "Stripe Trigger",
    description: "Stripe Trigger",
    icon: "/stripe.svg",
  },
];

const executionNodes: NodeTypeOption[] = [
  {
    type: NodeType.HTTP_REQUEST,
    label: "HTTP Request",
    description: "HTTP Request",
    icon: GlobeIcon,
  },
];

interface NodeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export const NodeSelector = ({
  open,
  onOpenChange,
  children,
}: NodeSelectorProps) => {
  const { setNodes, getNodes, screenToFlowPosition } = useReactFlow();

  const handleNodeSelect = useCallback(
    (nodeType: NodeType) => {
      if (nodeType === NodeType.MANUAL_TRIGGER) {
        const nodes = getNodes();
        const hasManualTrigger = nodes.some(
          (node) => node.type === NodeType.MANUAL_TRIGGER,
        );
        if (hasManualTrigger) {
          toast.error("Manual Trigger already exists");
          return;
        }
      }

      setNodes((nodes) => {
        const hasInitialTrigger = nodes.some(
          (node) => node.type === NodeType.INITIAL,
        );

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        const flowPosition = screenToFlowPosition({
          x: centerX + (Math.random() - 0.5) * 200,
          y: centerY + (Math.random() - 0.5) * 200,
        });

        const newNode = {
          id: createId(),
          data: {},
          position: flowPosition,
          type: nodeType,
        };

        if (hasInitialTrigger) {
          return [newNode];
        }

        return [...nodes, newNode];
      });

      onOpenChange(false);
    },
    [getNodes, screenToFlowPosition, setNodes, onOpenChange],
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>What do you want to do?</SheetTitle>
          <SheetDescription>
            Select a node to add to the workflow
          </SheetDescription>
        </SheetHeader>
        <div>
          <div className="mb-4">
            {triggerNodes.map((node) => {
              const Icon = node.icon;
              return (
                <div
                  key={node.type}
                  className="w-full justify-start h-auto py-5 px-4 rounded-none cursor-pointer border-l-2 border-transparent hover:border-l-primary flex items-center gap-3"
                  onClick={() => handleNodeSelect(node.type)}
                >
                  {typeof Icon === "string" ? (
                    <Image src={Icon} alt={node.label} width={20} height={20} />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                  <div className="flex flex-col items-start text-left">
                    <span className="font-medium text-sm">{node.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {node.description}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <Separator />
          <div>
            {executionNodes.map((node) => {
              const Icon = node.icon;
              return (
                <div
                  key={node.type}
                  className="w-full justify-start h-auto py-5 px-4 rounded-none cursor-pointer border-l-2 border-transparent hover:border-l-primary flex items-center gap-3"
                  onClick={() => handleNodeSelect(node.type)}
                >
                  {typeof Icon === "string" ? (
                    <Image src={Icon} alt={node.label} width={20} height={20} />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                  <div className="flex flex-col items-start text-left">
                    <span className="font-medium text-sm">{node.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {node.description}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

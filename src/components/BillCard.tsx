
import React from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import Switch from "../ui/Switch";
import { Edit, Trash2, Pause, Play } from "lucide-react";

interface BillCardProps {
  bill: any;
  onToggleAutopay: (id: string, value: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onTogglePause: (id: string) => void;
}

export function BillCard({
  bill,
  onToggleAutopay,
  onEdit,
  onDelete,
  onTogglePause,
}: BillCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge variant="default">Paid</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      case "upcoming":
        return <Badge variant="outline">Upcoming</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card className="flex items-center justify-between gap-4 p-4 hover:shadow-lg bg-card/90 backdrop-blur-sm border border-border rounded-2xl transition-all duration-300 hover:scale-[1.01]">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Icon Container */}
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm ${bill.color}`}
        >
          {React.cloneElement(bill.icon, { className: "w-5 h-5" })}
        </div>

        {/* Bill Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground line-clamp-1">{bill.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-1">{bill.provider}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {bill.category}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {bill.frequency}
            </Badge>
          </div>
        </div>
      </div>

      {/* Amount & Status */}
      <div className="text-center flex-shrink-0 min-w-[100px]">
        <p className="font-bold text-lg text-foreground">{bill.amount}</p>
        {getStatusBadge(bill.status)}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:inline">Auto-pay</span>
          <Switch
            checked={bill.autopay}
            onCheckedChange={(val) => onToggleAutopay(bill.id, val)}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(bill.id)}
            className="p-1 rounded-md hover:bg-accent transition-colors"
          >
            <Edit className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => onTogglePause(bill.id)}
            className="p-1 rounded-md hover:bg-accent transition-colors"
          >
            {bill.status === "paid" ? (
              <Pause className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Play className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          <button
            onClick={() => onDelete(bill.id)}
            className="p-1 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}

export default BillCard;

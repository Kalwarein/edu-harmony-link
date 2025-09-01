import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

interface AssignmentsPageProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export const AssignmentsPage = ({ user }: AssignmentsPageProps) => {
  const [selectedStatus, setSelectedStatus] = useState("all");

  const statusCounts = {
    pending: 0,
    overdue: 0,
    submitted: 0,
  };

  const statusFilters = [
    { id: "all", label: "All", color: "bg-academy-brown text-white" },
    { id: "pending", label: "Pending", color: "bg-academy-cream text-academy-brown" },
    { id: "submitted", label: "Submitted", color: "bg-green-100 text-green-800" },
    { id: "overdue", label: "Overdue", color: "bg-red-100 text-red-800" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-8 h-8 text-academy-brown" />
        <h1 className="text-3xl font-bold text-foreground">My Assignments</h1>
      </div>

      {/* Assignment Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-card border-border shadow-sm text-center">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-academy-yellow mb-2">
              {statusCounts.pending}
            </div>
            <div className="text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border shadow-sm text-center">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-red-500 mb-2">
              {statusCounts.overdue}
            </div>
            <div className="text-muted-foreground">Overdue</div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border shadow-sm text-center">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-green-500 mb-2">
              {statusCounts.submitted}
            </div>
            <div className="text-muted-foreground">Submitted</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-3">
        {statusFilters.map((filter) => (
          <Button
            key={filter.id}
            onClick={() => setSelectedStatus(filter.id)}
            variant={selectedStatus === filter.id ? "default" : "outline"}
            className={`
              px-6 py-2 rounded-full border-2
              ${selectedStatus === filter.id 
                ? filter.color 
                : "border-academy-brown text-academy-brown hover:bg-academy-cream"
              }
              transition-all duration-200
            `}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Assignments Content */}
      <Card className="bg-card border-border shadow-sm">
        <CardContent className="p-12">
          <div className="text-center space-y-4">
            <BookOpen className="w-20 h-20 mx-auto text-academy-brown opacity-50" />
            <h2 className="text-2xl font-bold text-foreground">No Assignments Found</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              There are no assignments matching your current filter. Keep checking for new assignments from your teachers.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

type ChamaActivity = {
  id: string;
  activity_type: string;
  amount: number | null;
  description: string;
  created_at: string;
};

interface ChamaActivitiesProps {
  chamaId: string;
}

const ChamaActivities: React.FC<ChamaActivitiesProps> = ({ chamaId }) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ChamaActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!user || !chamaId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from("chama_activities")
          .select("*")
          .eq("chama_id", chamaId)
          .order("created_at", { ascending: false })
          .limit(10);
        
        if (error) {
          console.error("Error fetching activities:", error);
          setError("Failed to load activities");
          setActivities([]);
          return;
        }
        
        setActivities(data || []);
      } catch (error) {
        console.error("Unexpected error fetching activities:", error);
        setError("An unexpected error occurred");
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();

    // Set up real-time subscription for new activities
    const channel = supabase
      .channel('chama-activities')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chama_activities',
          filter: `chama_id=eq.${chamaId}`
        },
        (payload) => {
          console.log('New activity received:', payload);
          setActivities(prev => [payload.new as ChamaActivity, ...prev.slice(0, 9)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, chamaId]);

  if (loading) {
    return (
      <Card className="mb-3">
        <CardHeader>
          <CardTitle>Recent Group Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Loader2 className="animate-spin h-4 w-4" />
            <span>Loading activities...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-3">
        <CardHeader>
          <CardTitle>Recent Group Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-red-500">{error}</CardDescription>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className="mb-3">
        <CardHeader>
          <CardTitle>Recent Group Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>No recent activities</CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-3">
      <CardHeader>
        <CardTitle>Recent Group Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {activities.map((activity) => (
            <li key={activity.id} className="text-sm border-b last:border-b-0 pb-2">
              <span className="font-semibold capitalize">
                {activity.activity_type.replace("_", " ")}:
              </span>{" "}
              {activity.description}
              {activity.amount && (
                <span className="text-green-600 font-medium">
                  {" "}(KES {activity.amount.toFixed(2)})
                </span>
              )}
              <br />
              <span className="text-xs text-muted-foreground">
                {new Date(activity.created_at).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default ChamaActivities;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopNavbar from "@/components/TopNavbar";
import BottomNavBar from "@/components/BottomNavBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import TimePicker from "@/components/TimePicker";

interface ItineraryProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

interface Activity {
  id: number;
  day: number;
  time: string;
  title: string;
  notes: string;
  location: string;
}

const backend = "https://travel-app1-p0m8.onrender.com";

const Itinerary = ({ theme, toggleTheme }: ItineraryProps) => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [newActivity, setNewActivity] = useState({
    day: 1,
    time: "",
    title: "",
    notes: "",
    location: "",
  });

  useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!user || !token) return navigate("/login");

    fetch(`${backend}/api/itinerary`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          navigate("/login");
        }
        return res.json();
      })
      .then((data) => setActivities(data))
      .catch(() => toast.error("Failed to load itinerary"));
  }, [navigate]);

  const saveActivities = (updated: Activity[]) => {
    setActivities(updated);
  };

  const addActivity = async () => {
    const token = localStorage.getItem("token");
    if (!newActivity.title || !newActivity.time) {
      return toast.error("Please fill in time and title");
    }

    const res = await fetch(`${backend}/api/itinerary`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newActivity),
    });

    if (!res.ok) return toast.error("Failed to add activity");

    const created: Activity = await res.json();

    const updated = [...activities, created].sort((a, b) =>
      a.day === b.day ? a.time.localeCompare(b.time) : a.day - b.day
    );

    saveActivities(updated);
    setNewActivity({ day: 1, time: "", title: "", notes: "", location: "" });
    setShowForm(false);
    toast.success("Activity added!");
  };

  const removeActivity = async (id: number) => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${backend}/api/itinerary/delete/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return toast.error("Failed to delete activity");

    saveActivities(activities.filter((a) => a.id !== id));
    toast.success("Activity removed");
  };

  const groupedByDay = activities.reduce((acc, activity) => {
    if (!acc[activity.day]) acc[activity.day] = [];
    acc[activity.day].push(activity);
    return acc;
  }, {} as Record<number, Activity[]>);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <TopNavbar theme={theme} toggleTheme={toggleTheme} />

      <div className="container py-8 max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
              Trip Itinerary
            </h1>
            <p className="text-muted-foreground">Plan your perfect adventure</p>
          </div>

          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Activity
          </Button>
        </div>

        {showForm && (
          <div className="mb-8 p-6 rounded-xl border bg-card shadow-soft space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Day</label>
                <Input
                  type="number"
                  min="1"
                  value={newActivity.day}
                  onChange={(e) =>
                    setNewActivity({ ...newActivity, day: Number(e.target.value) })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Time</label>
                <TimePicker
                  value={newActivity.time}
                  onChange={(val) => setNewActivity({ ...newActivity, time: val })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input
                value={newActivity.title}
                onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                placeholder="Activity name"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Location</label>
              <Input
                value={newActivity.location}
                onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
                placeholder="Where is this activity?"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Notes</label>
              <Textarea
                value={newActivity.notes}
                onChange={(e) => setNewActivity({ ...newActivity, notes: e.target.value })}
                rows={3}
                placeholder="Any additional details..."
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={addActivity} className="flex-1">
                Add Activity
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {Object.keys(groupedByDay).length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">No activities yet</p>
            <Button onClick={() => setShowForm(true)}>Start Planning</Button>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedByDay).map(([day, list]) => (
              <div key={day}>
                <h2 className="text-2xl font-bold mb-4">Day {day}</h2>
                <div className="space-y-3">
                  {list.map((a) => (
                    <div
                      key={a.id}
                      className="flex gap-3 p-4 rounded-xl border bg-card shadow-soft hover:shadow-medium"
                    >
                      <GripVertical className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <h3 className="font-semibold text-lg">{a.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {a.time} • {a.location}
                            </p>
                          </div>

                          <Button variant="ghost" size="icon" onClick={() => removeActivity(a.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {a.notes && <p className="text-sm text-muted-foreground">{a.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavBar />
    </div>
  );
};

export default Itinerary;

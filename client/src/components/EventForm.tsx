import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CalendarIcon, Upload, MapPin } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Validation schema
const eventFormSchema = z.object({
  title: z.string().min(3, "Event title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  goalAmount: z.coerce.number().min(1, "Goal amount must be at least $1").refine((val) => {
    return val > 0;
  }, "Goal amount must be a positive number"),
  location: z.string().optional(),
  deadline: z.date().optional(),
  isPublic: z.boolean(),
  coverImage: z.string().optional(), // Base64 data URL or empty string
});

type EventFormData = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  onSubmit?: (data: any) => void;
  isSubmitting?: boolean;
}

export default function EventForm({ onSubmit, isSubmitting = false }: EventFormProps) {
  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    mode: "onChange", // Validate on change for better UX
    defaultValues: {
      title: "",
      description: "",
      goalAmount: 0,
      location: "",
      deadline: undefined,
      isPublic: true,
      coverImage: "",
    },
  });

  // Handle image file upload and convert to base64
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      form.setError('coverImage', {
        type: 'manual',
        message: 'Please select a valid image file'
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      form.setError('coverImage', {
        type: 'manual',
        message: 'Image size must be less than 5MB'
      });
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      form.setValue('coverImage', base64String);
      form.clearErrors('coverImage');
    };
    reader.onerror = () => {
      form.setError('coverImage', {
        type: 'manual',
        message: 'Failed to read image file'
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (data: EventFormData) => {
    const eventData = {
      title: data.title,
      description: data.description,
      goalAmount: data.goalAmount, // Already a number from the schema
      location: data.location || undefined,
      deadline: data.deadline ? data.deadline.toISOString() : undefined,
      isPublic: data.isPublic,
      coverImage: data.coverImage || undefined,
      status: 'active',
    };
    onSubmit?.(eventData);
  };

  const handleSubmitError = (errors: any) => {
    // Form validation errors are handled by react-hook-form and displayed in the UI
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Create Fundraising Event</CardTitle>
        <CardDescription>Share your cause and start raising funds</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit, handleSubmitError)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Give your event a compelling title"
                        {...field}
                        data-testid="input-title"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell your story and explain why this cause matters..."
                        rows={6}
                        {...field}
                        data-testid="input-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="goalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fundraising Goal (UGX) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="10000"
                          {...field}
                          data-testid="input-goal"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Event location"
                            className="pl-9"
                            {...field}
                            data-testid="input-location"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Deadline</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            data-testid="button-deadline"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : "Select deadline (optional)"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="coverImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Image</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="cursor-pointer"
                            data-testid="input-cover-image"
                          />
                          {field.value && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                form.setValue('coverImage', '');
                                // Reset file input
                                const fileInput = document.querySelector('[data-testid="input-cover-image"]') as HTMLInputElement;
                                if (fileInput) fileInput.value = '';
                              }}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        {field.value && (
                          <div className="relative h-48 rounded-md overflow-hidden border">
                            <img 
                              src={field.value} 
                              alt="Cover preview" 
                              className="w-full h-full object-cover"
                              onError={() => {
                                form.setError('coverImage', {
                                  type: 'manual',
                                  message: 'Failed to load image'
                                });
                              }}
                            />
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Upload an image file (JPG, PNG, etc.). Maximum size: 5MB
                        </p>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="space-y-0.5">
                        <FormLabel className="cursor-pointer">Make event public</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Public events appear in listings. Private events are only accessible via link.
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-public"
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base" 
              data-testid="button-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Event..." : "Create Event & Generate Link"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

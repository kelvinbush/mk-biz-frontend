"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Eye,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  emailAddress: z.string().email("Invalid email address"),
  role: z.enum(["Admin", "Manager", "Viewer"], {
    required_error: "Role is required",
  }),
});

interface TeamMember {
  id: string;
  name: string;
  email: string;
  lastActive: string;
  status: "Active" | "Pending acceptance";
  avatar: string;
  role: "Admin" | "Manager" | "Viewer";
}

const initialMembers: TeamMember[] = [
  {
    id: "1",
    name: "Kelvin Wachiye",
    email: "kelvin.wachiye@melaninkapital.com",
    lastActive: "June 30, 2024",
    status: "Pending acceptance",
    avatar: "/placeholder.svg?height=32&width=32",
    role: "Admin",
  },
  {
    id: "2",
    name: "Abel Amawayi",
    email: "abel.amawayi@melaninkapital.com",
    lastActive: "June 28, 2024",
    status: "Active",
    avatar: "/placeholder.svg?height=32&width=32",
    role: "Manager",
  },
];

export default function TeamMembers() {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      emailAddress: "",
      role: undefined,
    },
  });

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const newMember: TeamMember = {
      id: Math.random().toString(36).substr(2, 9),
      name: values.fullName,
      email: values.emailAddress,
      role: values.role,
      lastActive: new Date().toLocaleDateString(),
      status: "Pending acceptance",
      avatar: "/placeholder.svg?height=32&width=32",
    };
    setMembers([...members, newMember]);
    setShowInviteDialog(false);
    form.reset();
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-full bg-emerald-50 p-3">
        <Plus className="h-6 w-6 text-emerald-500" />
      </div>
      <p className="text-sm text-muted-foreground">
        No team members found matching your search criteria.
      </p>
    </div>
  );

  const DeleteConfirmationDialog = () => (
    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center p-4 text-center">
          <div className="mb-4 rounded-full border-8 border-red-50">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
          <DialogTitle className="mb-2">
            Are you sure you want to remove this member?
          </DialogTitle>
          <DialogDescription className="mb-4">
            This action is permanent and cannot be undone!
          </DialogDescription>
          <div className="flex w-full gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowDeleteDialog(false)}
            >
              No, Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => {
                if (selectedMember) {
                  setMembers(members.filter((m) => m.id !== selectedMember.id));
                  setShowDeleteDialog(false);
                  setSelectedMember(null);
                }
              }}
            >
              Yes, Remove
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">Team Members</h1>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[300px] pl-9 pr-9"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Invite team member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Invite team member</DialogTitle>
                <DialogDescription>
                  Add a new member to your team
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emailAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="john.doe@example.com"
                            type="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="Manager">Manager</SelectItem>
                            <SelectItem value="Viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2">
                    <DialogClose asChild>
                      <Button variant="outline" type="button">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button type="submit">Send invitation</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {paginatedMembers.length === 0 ? (
        <EmptyState />
      ) : (
        <Table className="rounded-lg border">
          <TableHeader className="bg-[#E8E9EA]">
            <TableRow>
              <TableHead className="text-midnight-blue">USER</TableHead>
              <TableHead className="text-midnight-blue">ROLE</TableHead>
              <TableHead className="text-midnight-blue">LAST ACTIVE</TableHead>
              <TableHead className="text-midnight-blue">STATUS</TableHead>
              <TableHead className="text-center text-midnight-blue">
                ACTIONS
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatar}
                      alt=""
                      className="h-8 w-8 rounded-full"
                    />
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {member.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-medium">
                    {member.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{member.lastActive}</span>
                    {member.status === "Pending acceptance" && (
                      <span className="text-sm text-muted-foreground">
                        User added on this date
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "rounded-lg bg-opacity-20 font-medium",
                      member.status === "Active"
                        ? "bg-emerald-600 text-emerald-600"
                        : "bg-blue-600 text-blue-600",
                    )}
                  >
                    {member.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Dialog
                      open={showDetailsDialog && selectedMember?.id === member.id}
                      onOpenChange={(open) => {
                        setShowDetailsDialog(open);
                        if (!open) setSelectedMember(null);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-deep-blue-500"
                          onClick={() => setSelectedMember(member)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Team member details</DialogTitle>
                          <DialogDescription>
                            View team member&apos;s details below
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Full name</label>
                            <p className="mt-1">{member.name}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">
                              Email address
                            </label>
                            <p className="mt-1">{member.email}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Role</label>
                            <p className="mt-1">{member.role}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Status</label>
                            <p className="mt-1">{member.status}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">
                              Last active
                            </label>
                            <p className="mt-1">{member.lastActive}</p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500"
                      onClick={() => {
                        setSelectedMember(member);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
          {Math.min(currentPage * itemsPerPage, filteredMembers.length)} of{" "}
          {filteredMembers.length} results
        </p>
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            {"<"}
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="icon"
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            {">"}
          </Button>
        </div>
      </div>

      <DeleteConfirmationDialog />
    </div>
  );
}

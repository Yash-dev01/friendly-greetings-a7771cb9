import { useEffect, useState } from "react";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Briefcase, MapPin, DollarSign, Search } from "lucide-react";
import { motion } from "framer-motion";
import { jobService } from "../services/jobService";
import type { Job } from "../services/jobService";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "../components/ui/drawer";

export function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await jobService.getJobs();
        const jobList = Array.isArray(res.data) ? res.data : [];
        setJobs(jobList.filter((j) => j.isActive === true));
      } catch (err: any) {
        setError(err.message || "Failed to load jobs");
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLocation =
      !locationFilter ||
      job.location.toLowerCase().includes(locationFilter.toLowerCase());

    return matchesSearch && matchesLocation;
  });

  if (loading)
    return (
      <div className="text-center py-10 text-gray-500">Loading jobs...</div>
    );
  if (error)
    return (
      <div className="text-center py-10 text-red-500">{error}</div>
    );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Job Opportunities</h1>
      <p className="text-gray-600">
        Explore career opportunities posted by alumni
      </p>

      {/* Search Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search by role/company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Filter by location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      {/* Job Cards */}
      <div className="space-y-4">
        {filteredJobs.map((job, index) => (
          <motion.div
            key={job._id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group"
          >
            <Card className="p-5 border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-200 rounded-xl">
              {/* Header */}
              <div className="flex justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-blue-100 text-blue-600 font-bold text-lg">
                    {job.company[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition">
                      {job.role}
                    </h3>
                    <p className="text-gray-500 text-sm">{job.company}</p>
                  </div>
                </div>

                <a href={job.applyLink} target="_blank">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    Apply
                  </Button>
                </a>
              </div>

              {/* Meta info */}
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-700">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-gray-500" /> {job.location}
                </span>

                <span className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-gray-500" /> {job.salaryRange}
                </span>

                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs">
                  {job.employmentType?.toUpperCase()}
                </span>
              </div>

              {/* Short Description */}
              <p className="text-gray-700 mt-3 line-clamp-3">{job.description}</p>

              <div className="text-right mt-3">
                <button
                  className="text-blue-600 text-sm font-medium hover:underline"
                  onClick={() => setSelectedJob(job)}
                >
                  View Details →
                </button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <Card>
          <div className="text-center py-10 text-gray-500">No jobs found.</div>
        </Card>
      )}

    {/* Drawer for Job Details using ShadCN/UI */}
<Drawer open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
  <DrawerContent className="md:max-w-lg p-6 relative flex flex-col h-full z-[60] mt-16">
    {/* Close button */}
    {/* <DrawerClose
      className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
      onClick={() => setSelectedJob(null)}
    /> */}

    {/* Header */}
    {selectedJob && (
      <DrawerHeader className="flex-none">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 flex items-center justify-center rounded-lg bg-blue-100 text-blue-600 font-bold text-lg">
            {selectedJob.company[0]}
          </div>
          <div>
            <DrawerTitle className="text-2xl">{selectedJob.role}</DrawerTitle>
            <p className="text-gray-500">{selectedJob.company}</p>
          </div>
        </div>
      </DrawerHeader>
    )}

    {/* Scrollable content */}
    {selectedJob && (
      <div className="flex-1 overflow-y-auto mt-6 space-y-6">
        {/* Meta Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
            <MapPin className="w-5 h-5 text-gray-500" />
            <span><b>Location:</b> {selectedJob.location}</span>
          </div>

          <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
            <DollarSign className="w-5 h-5 text-gray-500" />
            <span><b>Salary:</b> {selectedJob.salaryRange}</span>
          </div>

          <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg md:col-span-2">
            <Briefcase className="w-5 h-5 text-gray-500" />
            <span><b>Employment Type:</b> {selectedJob.employmentType}</span>
          </div>
        </div>

        {/* Description */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Job Description</h3>
          <p className="text-gray-700 text-sm leading-relaxed">{selectedJob.description}</p>
        </div>
      </div>
    )}

    {/* Apply Button */}
    {selectedJob && (
      <a href={selectedJob.applyLink} target="_blank">
        <Button className="w-full mt-4 flex-none">Apply Now</Button>
      </a>
    )}
  </DrawerContent>
</Drawer>



    </div>
  );
}

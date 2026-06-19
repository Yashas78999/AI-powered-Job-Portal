import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { jobsAPI } from '../services/api';
import { Search, Brain, MapPin, Briefcase, Calendar, ChevronLeft, ChevronRight, X, SlidersHorizontal, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function JobSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Search States
  const [isSmartMode, setIsSmartMode] = useState(searchParams.get('smart') === 'true');
  const [keywordQuery, setKeywordQuery] = useState(searchParams.get('keyword') || '');
  const [smartQuery, setSmartQuery] = useState(searchParams.get('q') || '');
  const [workMode, setWorkMode] = useState(searchParams.get('workMode') || '');
  const [jobType, setJobType] = useState(searchParams.get('jobType') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '0', 10));

  useEffect(() => {
    async function performSearch() {
      setLoading(true);
      try {
        let response;
        if (isSmartMode && smartQuery) {
          response = await jobsAPI.smartSearch(smartQuery, page);
        } else {
          const params = {
            page,
            size: 10
          };
          if (keywordQuery) params.keyword = keywordQuery;
          if (workMode) params.workMode = workMode;
          if (jobType) params.jobType = jobType;
          response = await jobsAPI.search(params);
        }
        setJobs(response.data);
      } catch (err) {
        toast.error('Failed to load jobs. Please check your search criteria.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    performSearch();
  }, [isSmartMode, smartQuery, keywordQuery, workMode, jobType, page]);

  const updateSearchUrl = (updates = {}) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === '') newParams.delete(key);
      else newParams.set(key, val);
    });
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    if (isSmartMode) {
      updateSearchUrl({ smart: 'true', q: smartQuery, keyword: '', page: '0' });
    } else {
      updateSearchUrl({ smart: '', q: '', keyword: keywordQuery, page: '0' });
    }
  };

  const handleFilterChange = (type, val) => {
    setPage(0);
    if (type === 'workMode') {
      setWorkMode(val);
      updateSearchUrl({ workMode: val, page: '0' });
    } else if (type === 'jobType') {
      setJobType(val);
      updateSearchUrl({ jobType: val, page: '0' });
    }
  };

  const clearAllFilters = () => {
    setKeywordQuery('');
    setSmartQuery('');
    setWorkMode('');
    setJobType('');
    setPage(0);
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header and Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-slate-900">Explore Careers</h1>
          <p className="text-slate-500 text-sm mt-1">Discover opportunities using keyword query or AI natural language search.</p>
        </div>

        {/* Search Mode Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit self-start md:self-auto">
          <button
            onClick={() => {
              setIsSmartMode(false);
              updateSearchUrl({ smart: 'false', q: '' });
            }}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              !isSmartMode
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Search className="w-4 h-4" />
            Standard Search
          </button>
          <button
            onClick={() => {
              setIsSmartMode(true);
              updateSearchUrl({ smart: 'true' });
            }}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              isSmartMode
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Brain className="w-4 h-4 text-indigo-500" />
            AI Smart Search
          </button>
        </div>
      </div>

      {/* Main Search Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-8">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          {isSmartMode ? (
            <div className="flex-1 flex items-center gap-3 border border-slate-300 rounded-xl px-4 py-3 bg-slate-50/50 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
              <Brain className="w-5 h-5 text-indigo-500 shrink-0" />
              <input
                type="text"
                value={smartQuery}
                onChange={(e) => setSmartQuery(e.target.value)}
                placeholder='Describe your ideal role (e.g. "Remote frontend contract React developer paying 10LPA+")'
                className="w-full bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center gap-3 border border-slate-300 rounded-xl px-4 py-3 bg-slate-50/50 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={keywordQuery}
                onChange={(e) => setKeywordQuery(e.target.value)}
                placeholder="Search by title, description, or keyword..."
                className="w-full bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
              />
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowMobileFilters(true)}
              className="sm:hidden border border-slate-300 hover:bg-slate-50 text-slate-700 p-3 rounded-xl flex items-center justify-center shrink-0 cursor-pointer"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
            <button
              type="submit"
              className="gradient-button flex-1 sm:flex-initial px-8 py-3 rounded-xl font-bold"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filters - Desktop */}
        <div className="hidden lg:block space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm sticky top-20">
            <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg">Filters</h3>
              {(workMode || jobType || keywordQuery || smartQuery) && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-red-500 hover:text-red-600 font-semibold cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Work Mode Filter */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-2.5 uppercase tracking-wider text-[11px]">Work Mode</label>
              <div className="space-y-2">
                {[
                  { label: 'All Modes', value: '' },
                  { label: 'Remote', value: 'REMOTE' },
                  { label: 'Onsite', value: 'ONSITE' },
                  { label: 'Hybrid', value: 'HYBRID' }
                ].map((mode) => (
                  <button
                    key={mode.value}
                    onClick={() => handleFilterChange('workMode', mode.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                      workMode === mode.value
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Job Type Filter */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2.5 uppercase tracking-wider text-[11px]">Job Type</label>
              <div className="space-y-2">
                {[
                  { label: 'All Types', value: '' },
                  { label: 'Full Time', value: 'FULL_TIME' },
                  { label: 'Part Time', value: 'PART_TIME' },
                  { label: 'Contract', value: 'CONTRACT' },
                  { label: 'Internship', value: 'INTERNSHIP' },
                  { label: 'Freelance', value: 'FREELANCE' }
                ].map((typeItem) => (
                  <button
                    key={typeItem.value}
                    onClick={() => handleFilterChange('jobType', typeItem.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                      jobType === typeItem.value
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {typeItem.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white border border-slate-200 rounded-2xl p-6 h-48 animate-pulse" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
              <Briefcase className="w-14 h-14 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800">No jobs match your search</h3>
              <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
                We couldn't find any listings matching your query. Try broadening your criteria, clearing active filters, or switching search modes.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-6 inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl px-5 py-2.5 text-sm transition-all cursor-pointer"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-6 hover:shadow-lg hover:border-indigo-150 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 uppercase tracking-wide">
                        {job.jobType?.replace('_', ' ')}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 uppercase tracking-wide">
                        {job.workMode}
                      </span>
                    </div>

                    <Link to={`/jobs/${job.id}`}>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {job.title}
                      </h3>
                    </Link>
                    <p className="text-slate-500 text-sm font-semibold mt-0.5">
                      {job.employer?.companyName || 'Verified Employer'}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {job.requiredSkills?.map((skill, index) => (
                        <span key={index} className="px-2.5 py-0.5 rounded bg-slate-100/80 text-xs text-slate-600 font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 border-slate-100 pt-4 md:pt-0 shrink-0 gap-4">
                    <div className="text-left md:text-right">
                      <span className="text-xs text-slate-400 block font-medium flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {job.location || 'Remote'}
                      </span>
                      {job.salaryMin && job.salaryMax ? (
                        <span className="text-sm font-bold text-slate-700 block mt-1">
                          ₹{job.salaryMin}L - ₹{job.salaryMax}LPA
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 block mt-1 font-semibold italic">Salary Disclosed on Interview</span>
                      )}
                    </div>

                    <Link
                      to={`/jobs/${job.id}`}
                      className="gradient-button px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1 group/btn"
                    >
                      Apply <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              ))}

              {/* Pagination Controls */}
              <div className="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-slate-200/60">
                <button
                  disabled={page === 0}
                  onClick={() => {
                    setPage(page - 1);
                    updateSearchUrl({ page: (page - 1).toString() });
                  }}
                  className="p-2 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                <span className="text-sm font-semibold text-slate-700">Page {page + 1}</span>
                <button
                  disabled={jobs.length < 10}
                  onClick={() => {
                    setPage(page + 1);
                    updateSearchUrl({ page: (page + 1).toString() });
                  }}
                  className="p-2 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Slider Filters Drawer */}
      {showMobileFilters && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 z-40 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
          <div className="fixed inset-y-0 right-0 max-w-sm w-full bg-white z-50 p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-lg">Filters</h3>
                <button onClick={() => setShowMobileFilters(false)}>
                  <X className="w-6 h-6 text-slate-400 hover:text-slate-600" />
                </button>
              </div>

              {/* Work Mode */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2.5 uppercase tracking-wider text-[11px]">Work Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'All Modes', value: '' },
                    { label: 'Remote', value: 'REMOTE' },
                    { label: 'Onsite', value: 'ONSITE' },
                    { label: 'Hybrid', value: 'HYBRID' }
                  ].map((mode) => (
                    <button
                      key={mode.value}
                      onClick={() => handleFilterChange('workMode', mode.value)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        workMode === mode.value
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Job Type */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2.5 uppercase tracking-wider text-[11px]">Job Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'All Types', value: '' },
                    { label: 'Full Time', value: 'FULL_TIME' },
                    { label: 'Part Time', value: 'PART_TIME' },
                    { label: 'Contract', value: 'CONTRACT' },
                    { label: 'Internship', value: 'INTERNSHIP' },
                    { label: 'Freelance', value: 'FREELANCE' }
                  ].map((typeItem) => (
                    <button
                      key={typeItem.value}
                      onClick={() => handleFilterChange('jobType', typeItem.value)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        jobType === typeItem.value
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {typeItem.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2 mt-6">
              <button
                onClick={clearAllFilters}
                className="w-full py-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-600 transition-all cursor-pointer"
              >
                Clear All Filters
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="gradient-button w-full py-3 rounded-xl text-sm font-bold cursor-pointer"
              >
                Show Results
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// src/pages/admin/ReportListPage.jsx
import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
import axios from 'axios'; // Using default axios with baseURL and token header

const ReportListPage = () => {
    // State for reports list, loading indicator, and errors
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingId, setUpdatingId] = useState(null); // Track which report is being updated

    // Define fetchReports using useCallback for stability
    const fetchReports = useCallback(async () => {
        // setLoading(true); // Avoid resetting loading on manual refresh
        setError(null);
        console.log('ReportListPage: Fetching /admin/reports...');
        try {
            const res = await axios.get('/admin/reports');
            console.log('ReportListPage: Received reports:', res.data);
            setReports(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            const errorMsg = err.response ? `${err.response.status} ${JSON.stringify(err.response.data)}` : err.message;
            console.error('ReportListPage: Error fetching reports:', errorMsg);
            setError('Failed to load reports list.');
            setReports([]);
        } finally {
            // Only set initial loading to false
             if (loading) setLoading(false);
        }
    // Only depend on loading if you want initial load state management
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading]);

    // Fetch reports when component mounts
    useEffect(() => {
        fetchReports();
    }, [fetchReports]); // Depend on the memoized fetchReports function

    // --- Handler for Update Status Buttons ---
    const handleStatusChange = async (reportId, newStatus) => {
        if (!reportId || !newStatus || updatingId) return; // Prevent multiple clicks while updating
        setUpdatingId(reportId); // Set loading state for this specific report's buttons

        console.log(`Attempting to change status of report ${reportId} to ${newStatus}`);
        try {
            // Send PUT request to the backend endpoint
            await axios.put(`/admin/reports/${reportId}/status`, { status: newStatus });

            alert(`Report ${reportId} status updated to ${newStatus}`);

            // Refresh the reports list to show the change immediately
            fetchReports(); // Call fetchReports again

        } catch (err) {
            const errorMsg = err.response ? err.response.data.msg || JSON.stringify(err.response.data.errors) : err.message;
            console.error(`ReportListPage: Error updating status for ${reportId}:`, errorMsg);
            alert(`Failed to update status: ${errorMsg}`);
        } finally {
            setUpdatingId(null); // Re-enable buttons for this row (by clearing updatingId)
        }
    };
    // ----------------------------------------


    // --- Render Logic ---
    if (loading) {
        return <div className="text-center mt-10 animate-pulse text-gray-500">Loading Reports...</div>;
    }

    if (error) {
        return <div className="text-center mt-10 text-red-600 bg-red-100 p-4 rounded border border-red-300">{error}</div>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Admin: Reported Posts</h1>
            <div className="overflow-x-auto bg-white shadow rounded-lg">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            <th className="px-5 py-3">Reported Post</th>
                            <th className="px-5 py-3">Source</th>
                            <th className="px-5 py-3">Reporter</th>
                            <th className="px-5 py-3">Reason</th>
                            <th className="px-5 py-3">Status</th>
                            <th className="px-5 py-3">Reported At</th>
                            <th className="px-5 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.length > 0 ? (
                            reports.map(report => {
                                const isCurrentReportUpdating = updatingId === report._id;
                                const isPending = report.status === 'Pending';

                                return (
                                <tr key={report._id} className="border-b border-gray-200 hover:bg-gray-50">
                                    {/* Report Title/Link */}
                                    <td className="px-5 py-4 text-sm"><a href={report.link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline" title={report.link}>{report.title || report.postId}</a></td>
                                    {/* Source */}
                                    <td className="px-5 py-4 text-sm">{report.source}</td>
                                    {/* Reporter */}
                                    <td className="px-5 py-4 text-sm">{report.reportedBy?.name || 'N/A'} <span className="block text-xs text-gray-500">{report.reportedBy?.email || ''}</span></td>
                                    {/* Reason */}
                                    <td className="px-5 py-4 text-sm">{report.reason || '-'}</td>
                                    {/* Status */}
                                    <td className="px-5 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${ report.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : report.status === 'Reviewed' ? 'bg-blue-100 text-blue-800 border border-blue-300' : report.status === 'ActionTaken' ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-gray-100 text-gray-800 border border-gray-300'}`}>
                                            {report.status}
                                        </span>
                                    </td>
                                    {/* Reported At */}
                                    <td className="px-5 py-4 text-sm">{new Date(report.reportedAt).toLocaleString()}</td>
                                    {/* Actions */}
                                    <td className="px-5 py-4 text-sm whitespace-nowrap">
                                        {/* Buttons call handleStatusChange with ID and new status */}
                                        <button
                                            onClick={() => handleStatusChange(report._id, 'Reviewed')}
                                            disabled={!isPending || isCurrentReportUpdating} // Disable if not Pending or currently updating
                                            title={isPending ? "Mark as Reviewed" : "Already actioned"}
                                            className={`mr-1 px-2 py-1 text-xs rounded ${!isPending || isCurrentReportUpdating ? 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-50' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                                        >
                                            {isCurrentReportUpdating ? '...' : 'Reviewed'}
                                        </button>
                                         <button
                                            onClick={() => handleStatusChange(report._id, 'Dismissed')}
                                            disabled={!isPending || isCurrentReportUpdating}
                                            title={isPending ? "Dismiss Report" : "Already actioned"}
                                            className={`px-2 py-1 text-xs rounded ${!isPending || isCurrentReportUpdating ? 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-50' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                        >
                                             {isCurrentReportUpdating ? '...' : 'Dismiss'}
                                        </button>
                                        {/* Add 'ActionTaken' button if needed */}
                                    </td>
                                </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center py-10 text-gray-500">No posts have been reported yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReportListPage;
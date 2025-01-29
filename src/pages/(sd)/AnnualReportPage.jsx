import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import NotificationSD from "../../components/NotificationSD";
import NotificationCSD from "../../components/NotificationCSD";

const AnnualReportPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [year, setYear] = useState("");
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [reports, setReports] = useState([]); // To store fetched reports
    const [filterYear, setFilterYear] = useState(""); // To store selected filter year

    // Fetch all uploaded reports
    const fetchReports = async () => {
        try {
            const response = await fetch(
                "https://ai-backend-drcx.onrender.com/api/get/annual-reports"
            );
            const result = await response.json();
            if (response.ok) {
                setReports(result);
            } else {
                alert("Failed to fetch reports.");
            }
        } catch (error) {
            console.error("Error fetching reports:", error);
        }
    };

    useEffect(() => {
        fetchReports(); // Fetch reports on page load
    }, []);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (file && file.type !== "application/pdf") {
            alert("Please upload a PDF file.");
            return;
        }

        const formData = new FormData();
        formData.append("year", year);
        formData.append("file", file);

        try {
            setIsUploading(true);

            const response = await fetch(
                "https://ai-backend-drcx.onrender.com/api/upload-annual-report",
                {
                    method: "POST",
                    body: formData,
                }
            );

            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                fetchReports(); // Re-fetch the reports after successful upload
            } else {
                alert("Error: " + result.message);
            }
        } catch (error) {
            console.error("Error uploading annual report:", error);
            alert("An error occurred while uploading the report.");
        } finally {
            setIsUploading(false);
            setYear("");
            setFile(null);
            setIsModalOpen(false);
        }
    };

    // Filter reports by year
    const filteredReports = filterYear
        ? reports.filter((report) => report.year === filterYear)
        : reports;

    return (
        <section className="h-screen flex">
            <Sidebar />
            <main className="h-full w-[80%] border overflow-auto">
                <div className="header py-5 px-7 flex justify-between items-center">
                    <h1 className="text-2xl text-gray-900">Annual Report</h1>

                    {/* Button to open modal */}
                    {localStorage.getItem("role") === "0" ? (
                        <NotificationSD />
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-blue-500 text-white px-4 py-2 rounded"
                            >
                                Upload Annual Report
                            </button>
                            <NotificationCSD />
                        </div>
                    )}
                </div>
                <hr />

                {/* Filter by Year */}
                <div className="py-4 px-7">
                    <label
                        htmlFor="filterYear"
                        className="text-sm font-medium text-gray-700"
                    >
                        Filter by Year:
                    </label>
                    <select
                        id="filterYear"
                        value={filterYear}
                        onChange={(e) => setFilterYear(e.target.value)}
                        className="border px-4 py-2 w-full rounded"
                    >
                        <option value="">All Years</option>
                        {/* Dynamically generate year options from 2024 to 2020 */}
                        {Array.from({ length: 5 }, (_, i) => 2024 - i).map(
                            (yearOption) => (
                                <option key={yearOption} value={yearOption}>
                                    {yearOption}
                                </option>
                            )
                        )}
                    </select>
                </div>

                {/* Display list of uploaded reports */}
                <div className="py-4 px-7">
                    <h2 className="text-xl mb-4">Uploaded Reports:</h2>

                    {filteredReports.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredReports.map((report) => (
                                <div
                                    key={report.annual_id}
                                    className="flex justify-center"
                                >
                                    <button
                                        onClick={() =>
                                            window.open(
                                                `/assets/report/${report.file_path}`, // Correct relative path
                                                "_blank"
                                            )
                                        }
                                        className="bg-gray-100 text-gray-800 px-6 py-4 rounded border border-dashed border-black w-full text-center"
                                    >
                                        {report.file_path}
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center">No reports available.</div>
                    )}
                </div>

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center">
                        <div className="bg-white p-8 rounded-lg w-1/3">
                            <h2 className="text-xl mb-4">
                                Upload Annual Report
                            </h2>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label
                                        htmlFor="year"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Year:
                                    </label>
                                    <select
                                        id="year"
                                        value={year}
                                        onChange={(e) =>
                                            setYear(e.target.value)
                                        }
                                        className="border px-4 py-2 w-full rounded"
                                        required
                                    >
                                        <option value="">Select Year</option>
                                        {/* Year options from 2024 to 2020 */}
                                        {Array.from(
                                            { length: 5 },
                                            (_, i) => 2024 - i
                                        ).map((yearOption) => (
                                            <option
                                                key={yearOption}
                                                value={yearOption}
                                            >
                                                {yearOption}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label
                                        htmlFor="file"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Upload PDF File:
                                    </label>
                                    <input
                                        type="file"
                                        id="file"
                                        accept="application/pdf"
                                        onChange={(e) =>
                                            setFile(e.target.files[0])
                                        }
                                        className="border px-4 py-2 w-full rounded"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-blue-500 text-white px-4 py-2 rounded"
                                        disabled={isUploading}
                                    >
                                        {isUploading
                                            ? "Uploading..."
                                            : "Submit"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </section>
    );
};

export default AnnualReportPage;

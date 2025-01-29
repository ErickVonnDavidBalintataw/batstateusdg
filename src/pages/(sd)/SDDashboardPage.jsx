import { useEffect, useState } from "react";
import Groq from "groq-sdk";
import Sidebar from "../../components/Sidebar";
import ScorePerCampusChart from "../../components/ScorePerCampusChart";
import BatStateUSDGScoreChart from "../../components/BatStateUSDGScoreChart";
import CampusScoreperSDGChart from "../../components/CampusScoreperSDGChart";
import CampusSDGScoreChart from "../../components/CampusSDGScorePage";
import Recommender from "../../components/Recommender";
import FileChart from "../../components/FileChart";
import { useNavigate } from "react-router-dom";
import NotificationCSD from "../../components/NotificationCSD";
import NewChart from "./NEwChart";
import TopsScore from "../../components/TopScore";
const groq = new Groq({
    apiKey: "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",
    dangerouslyAllowBrowser: true,
});

const SDDashboardPage = () => {
    const [topCampus, setTopCampus] = useState([]);
    const [sdOfficers, setSdOfficers] = useState([]);

    const [selectedSdgId, setSelectedSdgId] = useState("SDG01");
    const [campusScores, setCampusScores] = useState([]);
    const [instruments, setInstruments] = useState([]);
    const [lowestScoreCampuses, setLowestScoreCampuses] = useState([]);
    const [recommendations, setRecommendations] = useState("");

    // Step 1: Add state for selected year
    const [selectedYear, setSelectedYear] = useState("2024");

    // Step 2: Create an array for years
    const years = ["2025", "2024", "2023", "2022", "2021"];
    const navigate = useNavigate();
    useEffect(() => {
        const userId = localStorage.getItem("user_id");
        const role = localStorage.getItem("role");

        if (!userId || !role) {
            navigate("/login");
        }
    }, [navigate]);

    useEffect(() => {
        const getSDOfficers = async () => {
            try {
                const response = await fetch(
                    "https://ai-backend-drcx.onrender.com/api/get/sd-office"
                );
                const jsonData = await response.json();
                setSdOfficers(jsonData);
            } catch (err) {
                console.error(err.message);
            }
        };
        getSDOfficers();
    }, []);

    return (
        <section className="h-screen flex">
            <Sidebar />
            <main className="h-full w-[80%] border overflow-auto p-4">
                <div className="header py-5 px-7 flex justify-between items-center">
                    <h1 className="text-2xl text-gray-900">Dashboard</h1>

                    <div className="flex gap-2">
                        <select
                            name="year-selector"
                            id="year-selector"
                            className="border p-2 rounded"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                        >
                            <option value="">Select Year</option>
                            {years.map((year, index) => (
                                <option
                                    key={year}
                                    value={year}
                                    // Add a default selected year if needed
                                    selected={index === 0}
                                >
                                    {year}
                                </option>
                            ))}
                        </select>
                        <NotificationCSD />
                    </div>
                </div>
                <hr className="w-full border my-4" />
                {/* <div className="flex gap-4 mb-4">
                    <ScorePerCampusChart
                        setScores={setCampusScores}
                        setTopCampus={setTopCampus}
                        selectedYear={selectedYear}
                    />
                </div> */}
                <div className="flex gap-4 mb-2">
                    <NewChart selectedYear={selectedYear} />
                    <CampusSDGScoreChart
                        topCampus={topCampus}
                        selectedYear={selectedYear}
                    />
                </div>
                <Recommender selectedYear={selectedYear} />
            </main>
        </section>
    );
};

export default SDDashboardPage;

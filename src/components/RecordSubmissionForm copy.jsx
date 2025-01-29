import React, { useState, useEffect } from "react";
import excelFormula from "excel-formula";
import emailjs from "@emailjs/browser";
import Swal from "sweetalert2";

const RecordSubmissionForm = ({ selectedSdg, selectedYear }) => {
    const [instruments, setInstruments] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [error, setError] = useState("");
    const [formulas, setFormulas] = useState([]);
    const [scores, setScores] = useState([]);
    const [total, setTotal] = useState([]);
    const [summedAnswers, setSummedAnswers] = useState([]);
    const [campusId, setCampusID] = useState(null);
    const [updatedFormulas, setUpdatedFormulas] = useState([]);
    const [sectionFiles, setSectionFiles] = useState({});

    const [totalScore, setTotalScore] = useState(0);

    useEffect(() => {
        const calculateTotalScore = () => {
            const scores = Array.from(
                document.querySelectorAll("td.score")
            ).map((el) => parseFloat(el.textContent || "0"));
            const total = scores.reduce((acc, score) => acc + score, 0);
            setTotalScore(total);
        };

        calculateTotalScore();

        // Optional: recalculates if td.score content changes dynamically
        const observer = new MutationObserver(calculateTotalScore);
        document
            .querySelectorAll("td.score")
            .forEach((node) => observer.observe(node, { childList: true }));

        return () => observer.disconnect(); // Cleanup observer on component unmount
    }, [answers]);

    const [sumByQuestionID, setSumByQuestionID] = useState([]); // State to store the arr
    const campuses = {
        1: ["1", "5", "6", "9"],
        2: ["2", "7", "11", "8"],
        3: ["3"],
        10: ["10"],
        4: ["4"],
    };

    const campusNames = {
        1: "Pablo Borbon",
        2: "Alangilan",
        3: "Lipa",
        4: "Nasugbu",
        10: "Malvar",
        5: "Lemery",
        6: "Rosario",
        7: "Balayan",
        8: "Mabini",
        9: "San Juan",
        11: "Lobo",
    };

    // Fetch campus data when userId changes
    useEffect(() => {
        const fetchCampusData = async () => {
            try {
                const response = await fetch(
                    `https://ai-backend-drcx.onrender.com/api/get/sd-office/${localStorage.getItem(
                        "user_id"
                    )}`
                );

                if (response.ok) {
                    const data = await response.json();
                    setCampusID(data[0].campus_id); // Set the campus state with fetched campus IDs
                } else {
                    console.error("Failed to fetch campus data.");
                    setError("Failed to fetch campus data.");
                }
            } catch (err) {
                console.error("Error fetching campus data:", err);
                setError("An error occurred while fetching campus data.");
            }
        };

        if (localStorage.getItem("user_id")) {
            fetchCampusData();
        }
    }, []);

    // Flatten campuses to a single array for display based on matching campus key
    const flattenedCampuses = Object.keys(campuses).flatMap((key) => {
        if (campusId === key) {
            return campuses[key].map((campusId) => ({
                id: campusId,
                name: campusNames[campusId] || campusId,
            }));
        }
        return []; // Return an empty array if the key doesn't match
    });

    useEffect(() => {
        setInstruments([]);
        setAnswers([]);
        setFormulas([]);
        setUpdatedFormulas([]);
        const fetchInstruments = async () => {
            if (!selectedSdg) return;

            try {
                const response = await fetch(
                    `https://ai-backend-drcx.onrender.com/api/get/instrumentsbysdg/${selectedSdg}`
                );
                if (response.ok) {
                    const instrumentData = await response.json();

                    await fetchSectionsForInstruments(instrumentData);
                } else {
                    setError("Failed to fetch instruments.");
                }
            } catch (error) {
                setError("An error occurred while fetching instruments.");
            }
        };

        const fetchSectionsForInstruments = async (instrumentData) => {
            try {
                const updatedInstruments = await Promise.all(
                    instrumentData.map(async (instrument) => {
                        const sectionsResponse = await fetch(
                            `https://ai-backend-drcx.onrender.com/api/get/sectionsbyinstrument/${instrument.instrument_id}`
                        );
                        if (sectionsResponse.ok) {
                            const sections = await sectionsResponse.json();
                            const sectionsWithQuestions =
                                await fetchQuestionsForSections(sections);

                            return {
                                ...instrument,
                                section_contents: sectionsWithQuestions,
                            };
                        } else {
                            return { ...instrument, section_contents: [] };
                        }
                    })
                );
                setInstruments(updatedInstruments);
            } catch (error) {
                setError("An error occurred while fetching sections.");
            }
        };

        const fetchQuestionsForSections = async (sections) => {
            try {
                let fetchedFormulas = [];
                const sectionsWithQuestions = await Promise.all(
                    sections.map(async (section) => {
                        try {
                            const questionsResponse = await fetch(
                                `https://ai-backend-drcx.onrender.com/api/get/questions/${section.section_id}`
                            );

                            const fetchFormulas = await fetch(
                                `https://ai-backend-drcx.onrender.com/api/get/formula_per_section/${section.section_id}`
                            );
                            const formula = await fetchFormulas.json();

                            if (!formula.includes(section.section_id)) {
                                fetchedFormulas.push(formula[0]);
                            }

                            if (questionsResponse.ok) {
                                const questions =
                                    await questionsResponse.json();

                                return {
                                    ...section,
                                    questions: questions,
                                };
                            } else {
                                return { ...section, questions: [] };
                            }
                        } catch (error) {
                            return { ...section, questions: [] };
                        }
                    })
                );

                setFormulas(fetchedFormulas);
                return sectionsWithQuestions;
            } catch (error) {
                setError("An error occurred while fetching questions.");
                return sections.map((section) => ({
                    ...section,
                    questions: [],
                }));
            }
        };

        fetchInstruments();
    }, [selectedSdg]);

    const generateAnswers = (instrumentData) => {
        const answers = [];
        instrumentData.forEach((instrument) => {
            instrument.section_contents.forEach((section) => {
                section.questions.forEach((question) => {
                    flattenedCampuses.forEach((campus) => {
                        answers.push({
                            question_id: question.question_id,
                            sub_id: question.sub_id,
                            value: 0,
                            campus_id: campus.id,
                        });
                    });
                });
            });
        });

        return answers;
    };

    useEffect(() => {
        if (instruments.length > 0) {
            setAnswers(generateAnswers(instruments));
        }
    }, [instruments]);

    const handleInputChange = (e, question_id, sub_id, campus_id, type) => {
        let { value } = e.target;

        // Convert value to a number if the type is 'Number'
        if (type === "Number") {
            value = parseFloat(value) || 0;
        }

        setAnswers((prevAnswers) =>
            prevAnswers.map((answer) =>
                answer.question_id === question_id &&
                answer.sub_id === sub_id &&
                answer.campus_id === campus_id
                    ? { ...answer, value }
                    : answer
            )
        );
    };
    useEffect(() => {
        let uniqueFormulas;

        if (formulas && formulas.length > 0) {
            uniqueFormulas = formulas.reduce((acc, current) => {
                // Check if this formula_id has already been added to the accumulator
                if (
                    !acc.some((item) => item.formula_id === current.formula_id)
                ) {
                    acc.push(current);
                }
                return acc;
            }, []);
        }

        if (answers && answers.length > 0) {
            const summedAnswers = answers.reduce((acc, item) => {
                const questionId = item.question_id;
                const subId = item.sub_id;

                let value;
                if (typeof item.value === "string") {
                    value = `"${item.value}"`; // Adds double quotes around the string
                } else {
                    value = parseFloat(item.value); // Parses the value as a float
                }

                // Find if there's already an entry for this question_id and sub_id
                const existingEntry = acc.find(
                    (entry) =>
                        entry.question_id === questionId &&
                        entry.sub_id === subId
                );

                if (existingEntry) {
                    // If an entry exists, sum the value
                    existingEntry.value += value;
                } else {
                    // If no entry exists, create a new object
                    acc.push({
                        question_id: questionId,
                        sub_id: subId,
                        value: value,
                    });
                }

                return acc;
            }, []); // Initialize as an empty array

            setSumByQuestionID(summedAnswers); // Update the state with the summed answers as an array of objects
        } else {
            console.log("No answers or empty array", "marker");
        }
    }, [formulas, answers]); // Re-run effect whenever formulas or answers change

    useEffect(() => {
        if (
            formulas &&
            formulas.length > 0 &&
            sumByQuestionID &&
            sumByQuestionID.length > 0
        ) {
            // Filter unique formulas based on formula_id
            const uniqueFormulas = formulas.filter(
                (value, index, self) =>
                    index ===
                    self.findIndex((t) => t.formula_id === value.formula_id)
            );

            // Assuming sumByQuestionID is in the format similar to summationData
            const valueMap = {};
            sumByQuestionID.forEach((item) => {
                valueMap[item.sub_id] = item.value; // Create a map for fast lookup
            });

            // Function to replace values in the formula
            const replaceFormulaValues = (formula, valueMap) => {
                return formula.replace(/([A-Z]\d+)/g, (match) => {
                    return valueMap[match] !== undefined
                        ? valueMap[match]
                        : match;
                });
            };

            const updatedFormulasV = uniqueFormulas.map((formulaObj) => {
                const updatedFormula = replaceFormulaValues(
                    formulaObj.formula,
                    valueMap
                );

                return {
                    ...formulaObj,
                    formula: updatedFormula,
                    score: eval(excelFormula.toJavaScript(updatedFormula)),
                };
            });

            setUpdatedFormulas(updatedFormulasV); // Log the updated formulas with replaced values
        }
    }, [sumByQuestionID, formulas]);

    const [fileData, setFileData] = useState([]);
    const handleFileChange = (event, section_id) => {
        const selectedFiles = Array.from(event.target.files);
        setFileData((prev) => ({
            ...prev,
            [section_id]: selectedFiles,
        }));
    };

    const uploadFile = async (recordId) => {
        try {
            // Iterate over each section in fileData
            for (const sectionId in fileData) {
                for (const file of fileData[sectionId]) {
                    // Create a new FormData instance for each file
                    const formData = new FormData();
                    formData.append("files", file); // Append the file
                    formData.append("record_id", recordId); // Append the record ID
                    formData.append("section_id", sectionId); // Append the section ID

                    // Prepare sectionData structure to include in the form
                    const sectionData = {
                        record_id: recordId,
                        section_id: sectionId,
                    };
                    formData.append("sectionData", JSON.stringify(sectionData));

                    // Send the individual file request
                    const response = await fetch(
                        `https://ai-backend-drcx.onrender.com/api/upload-evidence/${recordId}`,
                        {
                            method: "POST",
                            body: formData,
                        }
                    );

                    if (!response.ok) throw new Error("Failed to upload file");

                    const result = await response.json();
                }
            }

            return true;
        } catch (error) {
            console.error("Error uploading files:", error);
            return false;
        }
    };

    const sendAnswers = async (recordId) => {
        const url = "https://ai-backend-drcx.onrender.com/api/add/answers";
        for (const answer of answers) {
            if (!answer.question_id || !answer.campus_id) {
                console.error("Invalid answer data:", answer);
                continue;
            }

            const data = {
                record_value_id: crypto.randomUUID(),
                value: answer.value.toString(),
                question_id: answer.question_id,
                record_id: recordId,
                campus_id: answer.campus_id,
            };

            try {
                const answerResponse = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });
                if (!answerResponse.ok)
                    throw new Error("Failed to submit answer");
                const result = await answerResponse.json();
            } catch (error) {
                console.error("Error submitting answer:", error);
            }
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const confirmation = await Swal.fire({
            title: "Are you sure?",
            text: "You are about to update the answers. Do you want to continue?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, update it!",
            cancelButtonText: "Cancel",
        });

        if (!confirmation.isConfirmed) {
            return; // Do nothing if the user cancels
        }

        const recordData = {
            user_id: localStorage.getItem("user_id"),
            status: 1,
            date_submitted: new Date().toISOString(),
            sdg_id: selectedSdg,
            year: selectedYear,
        };

        try {
            // Submit the record to the server
            const recordResponse = await fetch(
                "https://ai-backend-drcx.onrender.com/api/add/records",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(recordData),
                }
            );

            if (!recordResponse.ok) throw new Error("Failed to submit record");
            const record = await recordResponse.json();

            // Call uploadFile with the retrieved record_id
            if (!(await uploadFile(record.record_id))) {
                return; // Stop if file upload fails
            }

            const recordID = record.record_id;

            try {
                emailjs.send(
                    "service_84tcmsn",
                    "template_oj00ezl",
                    {
                        to_email: "justmyrgutierrez92@gmail.com",
                        subject: "Record Submission Notification",
                        message: `
                                    ==============================
                                    RECORD SUBMISSION NOTIFICATION
                                    ==============================

                                    Hello,

                                    A new record has been successfully submitted.

                                    Record Details:
                                    ---------------
                                    - Record ID: ${recordID}


                                    Thank you,
                                    SDO
                        `,
                    },
                    "F6fJuRNFyTkkvDqbm"
                );

                Swal.fire({
                    title: "Success!",
                    text: "Answers updated successfully.",
                    icon: "success",
                    confirmButtonText: "OK",
                });
            } catch (error) {
                console.error("Error submitting answer:", error);

                // Show error message with SweetAlert
                Swal.fire({
                    title: "Error!",
                    text: `An error occurred while updating the answers: ${error.message}`,
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }

            // Proceed to send answers using the record_id
            const res = await sendAnswers(record.record_id);
            if (res) {
                window.location.reload();
            }
        } catch (error) {
            console.error("Error during record submission:", error);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    {error && <p className="text-red-500">{error}</p>}
                    {instruments.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100"></thead>
                            <tbody className="bg-white divide-y divide-gray-200 text-sm">
                                {instruments.map((instrument, index) => (
                                    <React.Fragment
                                        key={instrument.instrument_id}
                                    >
                                        <tr>
                                            <td
                                                colSpan={
                                                    flattenedCampuses.length + 2
                                                }
                                                className="px-6 py-4 font-semibold text-left bg-gray-100"
                                            >
                                                {instrument.sdg_subtitle}
                                            </td>
                                        </tr>
                                        {instrument.section_contents.length >
                                        0 ? (
                                            instrument.section_contents.map(
                                                (section, sectionIndex) => (
                                                    <React.Fragment
                                                        key={section.section_id}
                                                    >
                                                        <tr>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                {
                                                                    section.section_content
                                                                }
                                                            </td>
                                                            {flattenedCampuses.map(
                                                                (campus) => (
                                                                    <td
                                                                        key={
                                                                            campus.id
                                                                        }
                                                                        className="border px-6 py-3"
                                                                    >
                                                                        {
                                                                            campus.name
                                                                        }
                                                                    </td>
                                                                )
                                                            )}
                                                        </tr>
                                                        {section.questions.map(
                                                            (
                                                                question,
                                                                index
                                                            ) => (
                                                                <React.Fragment
                                                                    key={
                                                                        question.question_id
                                                                    }
                                                                >
                                                                    <tr>
                                                                        <td className="border px-4 py-2 text-start whitespace-nowrap align-top">
                                                                            {index +
                                                                                1}
                                                                            .{" "}
                                                                            {
                                                                                question.question
                                                                            }
                                                                        </td>
                                                                        {flattenedCampuses.map(
                                                                            (
                                                                                campus
                                                                            ) => (
                                                                                <td
                                                                                    key={
                                                                                        campus.id
                                                                                    }
                                                                                    className="border px-4 py-2"
                                                                                >
                                                                                    <input
                                                                                        type="number"
                                                                                        min="0"
                                                                                        value={
                                                                                            answers.find(
                                                                                                (
                                                                                                    ans
                                                                                                ) =>
                                                                                                    ans.question_id ===
                                                                                                        question.question_id &&
                                                                                                    ans.sub_id ===
                                                                                                        question.sub_id &&
                                                                                                    ans.campus_id ===
                                                                                                        campus.id
                                                                                            )
                                                                                                ?.value ||
                                                                                            0
                                                                                        }
                                                                                        onChange={(
                                                                                            e
                                                                                        ) =>
                                                                                            handleInputChange(
                                                                                                e,
                                                                                                question.question_id,
                                                                                                question.sub_id,
                                                                                                campus.id
                                                                                            )
                                                                                        }
                                                                                        className="border rounded p-1 w-[5rem]"
                                                                                    />
                                                                                </td>
                                                                            )
                                                                        )}
                                                                        {/* <td className="border px-4 py-2 text-start whitespace-nowrap align-top">
                                                                            {updatedFormulas.find(
                                                                                (
                                                                                    formula
                                                                                ) =>
                                                                                    formula.section_id ===
                                                                                    section.section_id
                                                                            )
                                                                                ?.score ||
                                                                                0}
                                                                        </td> */}
                                                                    </tr>
                                                                </React.Fragment>
                                                            )
                                                        )}
                                                        <tr>
                                                            <td
                                                                colSpan={
                                                                    flattenedCampuses.length
                                                                }
                                                                className="border px-4 py-2 text-end whitespace-nowrap align-top"
                                                            >
                                                                Score
                                                            </td>
                                                            <td
                                                                colSpan={
                                                                    flattenedCampuses.length +
                                                                    1
                                                                }
                                                                className="score border px-4 py-2 text-end whitespace-nowrap align-top"
                                                            >
                                                                {updatedFormulas
                                                                    .filter(
                                                                        (
                                                                            formula
                                                                        ) =>
                                                                            formula.section_id ===
                                                                            section.section_id
                                                                    )
                                                                    .reduce(
                                                                        (
                                                                            acc,
                                                                            curr
                                                                        ) =>
                                                                            acc +
                                                                            (curr.score ||
                                                                                0),
                                                                        0
                                                                    )}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                colSpan={
                                                                    flattenedCampuses.length +
                                                                    1
                                                                }
                                                                className="border px-4 py-2 whitespace-nowrap align-top"
                                                            >
                                                                <div
                                                                    key={
                                                                        section.section_id
                                                                    }
                                                                >
                                                                    <label
                                                                        htmlFor={`file-${section.section_id}`}
                                                                    >
                                                                        Upload
                                                                        files
                                                                        for
                                                                    </label>
                                                                    <br />
                                                                    <input
                                                                        id={`file-${section.section_id}`}
                                                                        type="file"
                                                                        accept=".jpeg, .jpg, .png, .pdf"
                                                                        multiple
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            handleFileChange(
                                                                                e,
                                                                                section.section_id
                                                                            )
                                                                        }
                                                                    />
                                                                    {sectionFiles[
                                                                        section
                                                                            .section_id
                                                                    ] && (
                                                                        <ul>
                                                                            {fileData[
                                                                                section
                                                                                    .section_id
                                                                            ].map(
                                                                                (
                                                                                    file,
                                                                                    index
                                                                                ) => (
                                                                                    <li
                                                                                        key={
                                                                                            index
                                                                                        }
                                                                                    >
                                                                                        {
                                                                                            file.name
                                                                                        }
                                                                                    </li>
                                                                                )
                                                                            )}
                                                                        </ul>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        {index ===
                                                            instruments.length -
                                                                1 && (
                                                            <tr>
                                                                <td
                                                                    colSpan={
                                                                        flattenedCampuses.length +
                                                                        1
                                                                    }
                                                                    className="border px-4 text-end py-2 whitespace-nowrap align-top"
                                                                >
                                                                    Total Score:
                                                                    {totalScore}
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                )
                                            )
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={
                                                        flattenedCampuses.length +
                                                        1
                                                    }
                                                    className="px-6 py-4 text-center"
                                                >
                                                    No sections available
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No instruments available</p>
                    )}
                </div>
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded mt-5"
                >
                    Submit
                </button>
            </form>
        </div>
    );
};

export default RecordSubmissionForm;

import React, { useState, useEffect } from "react";
import excelFormula from "excel-formula";
import Swal from "sweetalert2";
import emailjs from "@emailjs/browser";

const UpdateRecordForm = ({ selectedSdg, selectedYear, recordId }) => {
    const [instruments, setInstruments] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [error, setError] = useState("");
    const [formulas, setFormulas] = useState([]);
    const [scores, setScores] = useState([]);
    const [total, setTotal] = useState([]);
    const [summedAnswers, setSummedAnswers] = useState([]);
    const [campusId, setCampusID] = useState(null);
    const [updatedFormulas, setUpdatedFormulas] = useState([]);
    const [existingAnswers, setExistingAnswers] = useState([]);

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

    useEffect(() => {
        const fetchExistingAnswers = async () => {
            try {
                const response = await fetch(
                    `https://ai-backend-drcx.onrender.com/api/get/answers/${recordId}`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch answers");
                }
                const data = await response.json();
                setAnswers(data);
            } catch (error) {
                console.error("Error fetching existing answers:", error);
            }
        };

        if (recordId) {
            fetchExistingAnswers();
        }
    }, [recordId]);

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
        setSumByQuestionID([]);
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
                            const fetchEvidenceResponse = await fetch(
                                `https://ai-backend-drcx.onrender.com/api/get/evidence/`,
                                {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                        section_id: section.section_id,
                                        record_id: recordId,
                                    }),
                                }
                            );

                            const evidences =
                                await fetchEvidenceResponse.json();

                            if (!formula.includes(section.section_id)) {
                                fetchedFormulas.push(formula[0]);

                                setFormulas((prevFormulas) => [
                                    ...prevFormulas,
                                    formula[0],
                                ]);
                            }

                            if (questionsResponse.ok) {
                                const questions =
                                    await questionsResponse.json();
                                return {
                                    ...section,
                                    questions: questions,
                                    evidences: evidences,
                                };
                            } else {
                                return {
                                    ...section,
                                    questions: [],
                                    evidences: [],
                                };
                            }
                        } catch (error) {
                            return { ...section, questions: [], evidences: [] };
                        }
                    })
                );
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

    const handleInputChange = (e, question_id, sub_id, campus_id) => {
        const { value } = e.target;

        setAnswers((prevAnswers) =>
            prevAnswers.map((answer) =>
                answer.question_id === question_id &&
                answer.sub_id === sub_id &&
                answer.campus_id === campus_id
                    ? { ...answer, value } // Directly assign the string value
                    : answer
            )
        );
    };
    useEffect(() => {
        const totalScore = updatedFormulas.reduce(
            (acc, curr) => acc + (curr.score || 0),
            0
        );

        setTotal(totalScore);
    }, [answers]);

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
                        section_id: item.section_id,
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
    }, [formulas, answers]);

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

            const valueMap = {};
            sumByQuestionID.forEach((item) => {
                valueMap[item.sub_id] = item.value; // Create a map for fast lookup
            });

            const valueMapBySection = sumByQuestionID.reduce((acc, item) => {
                // If the section doesn't exist in the accumulator, create it
                if (!acc[item.section_id]) {
                    acc[item.section_id] = {};
                }

                // Set the sub_id with its corresponding value
                acc[item.section_id][item.sub_id] = item.value;

                return acc;
            }, {});

            // Function to replace values in the formula
            const replaceFormulaValues = (formula, valueMap) => {
                return formula.replace(/([A-Z]\d+)/g, (match) => {
                    return valueMap[match] !== undefined ? valueMap[match] : 0;
                });
            };

            // Updated Formulas with failsafe evaluation
            const updatedFormulasV = uniqueFormulas.map((formulaObj) => {
                const updatedFormula = replaceFormulaValues(
                    formulaObj.formula,
                    valueMapBySection[formulaObj.section_id]
                );

                let result;
                try {
                    // Attempt to evaluate the formula
                    const jsFormula = excelFormula.toJavaScript(updatedFormula);

                    result = eval(jsFormula);

                    // Check if the result is NaN and fallback to 0
                    if (isNaN(result)) {
                        result = 0;
                    } else {
                        result = Math.round(result); // Round the result if it's valid
                    }
                } catch (error) {
                    result = 0; // Fallback to 0 in case of an error
                }

                return {
                    ...formulaObj,
                    formula: updatedFormula,
                    score: result, // Fallback to 0 if there's an error or NaN
                };
            });

            setUpdatedFormulas(updatedFormulasV); // Log the updated formulas with replaced values
        }
    }, [sumByQuestionID, formulas]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Show confirmation dialog before submitting the updates
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

        try {
            // Proceed with updating answers if confirmed
            const updatePromises = answers.map(async (answer) => {
                const response = await fetch(
                    "https://ai-backend-drcx.onrender.com/api/update/answers",
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(answer),
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        `Error: ${response.status} ${response.statusText}`
                    );
                }

                return await response.json();
            });

            // Wait for all updates to complete
            const updatedAnswers = await Promise.all(updatePromises);
            const editorName = localStorage.getItem("name"); // Retrieve the editor's name from local storage

            try {
                await emailjs.send(
                    "service_84tcmsn",
                    "template_oj00ezl",
                    {
                        to_email: "justmyrgutierrez92@gmail.com",
                        subject: "Notification: Record Submission Updated",
                        message: `
                            =====================================================
                            RECORD SUBMISSION NOTIFICATION
                            =====================================================
                            
                            Dear Sir/Madam,
            
                            We would like to inform you that an existing record has been successfully updated.
            
                            Details of the Updated Record:
                            -------------------------------------
                            - Updated By: ${editorName || "Unknown"} 
                            - Record ID: ${recordId}
            
                            If you have any questions or require further assistance, please feel free to contact us.
            
                            Best regards,  
                            Sustainable Development Office (SDO)
                        `,
                    },
                    "F6fJuRNFyTkkvDqbm"
                );
            } catch (emailError) {
                console.error("Error sending email:", emailError);
            }

            const notificationMessage = `
    A record has been updated.
    Please review the changes made to the record.
`;

            // Send a notification about the new record submission
            const notifResponse = await fetch(
                "https://ai-backend-drcx.onrender.com/api/create-notification",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId: localStorage.getItem("user_id"), // User ID from localStorage
                        notificationMessage,
                    }),
                }
            );

            if (!notifResponse.ok) {
                throw new Error("Failed to create notification.");
            }

            // Show success message with SweetAlert
            Swal.fire({
                title: "Success!",
                text: "Answers updated successfully.",
                icon: "success",
                confirmButtonText: "OK",
            });

            // Handle the updated answers as needed (e.g., updating local state)
        } catch (error) {
            console.error("Error updating answers:", error);

            // Show error message with SweetAlert
            Swal.fire({
                title: "Error!",
                text: `An error occurred while updating the answers: ${error.message}`,
                icon: "error",
                confirmButtonText: "OK",
            });
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
                                                (section) => (
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
                                                                        {flattenedCampuses &&
                                                                            flattenedCampuses.map(
                                                                                (
                                                                                    campus
                                                                                ) => (
                                                                                    <td>
                                                                                        {question.type ===
                                                                                        "Number" ? (
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
                                                                                        ) : (
                                                                                            <select
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
                                                                                                    ""
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
                                                                                                className="border rounded p-1 w-[10rem]"
                                                                                            >
                                                                                                <option
                                                                                                    value=""
                                                                                                    disabled
                                                                                                >
                                                                                                    Select
                                                                                                </option>
                                                                                                {question.options &&
                                                                                                    question.options.map(
                                                                                                        (
                                                                                                            optionObject
                                                                                                        ) => (
                                                                                                            <option
                                                                                                                key={
                                                                                                                    optionObject.option_id
                                                                                                                }
                                                                                                                value={
                                                                                                                    optionObject.option
                                                                                                                }
                                                                                                            >
                                                                                                                {
                                                                                                                    optionObject.option
                                                                                                                }
                                                                                                            </option>
                                                                                                        )
                                                                                                    )}
                                                                                            </select>
                                                                                        )}
                                                                                    </td>
                                                                                )
                                                                            )}
                                                                    </tr>
                                                                </React.Fragment>
                                                            )
                                                        )}
                                                        <tr>
                                                            <td
                                                                colSpan={
                                                                    flattenedCampuses.length +
                                                                    1
                                                                }
                                                                className="border px-4 py-2 text-end whitespace-nowrap align-top"
                                                            >
                                                                {"Score: " +
                                                                    updatedFormulas
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
                                                                className="border px-4 py-2"
                                                                colSpan={
                                                                    flattenedCampuses.length +
                                                                    1
                                                                }
                                                            >
                                                                {section
                                                                    .evidences
                                                                    .length >
                                                                    0 &&
                                                                    section.evidences.map(
                                                                        (
                                                                            evidence
                                                                        ) => (
                                                                            <button
                                                                                onClick={
                                                                                    () =>
                                                                                        window.open(
                                                                                            `../src/assets/evidence/${evidence.name}`,
                                                                                            "_blank"
                                                                                        ) // Construct full file path
                                                                                }
                                                                                className="bg-blue-500 text-white px-3 py-2 mr-2 rounded hover:bg-blue-600"
                                                                            >
                                                                                Open
                                                                                File
                                                                            </button>
                                                                        )
                                                                    )}
                                                            </td>
                                                        </tr>
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
                                        {instruments.length === index + 1 && (
                                            <tr>
                                                <td
                                                    className="border px-4 py-2 text-end"
                                                    colSpan={
                                                        flattenedCampuses.length +
                                                        1
                                                    }
                                                >
                                                    {"Total Score: " + total}
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
                    className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
                >
                    Submit
                </button>
            </form>
        </div>
    );
};

export default UpdateRecordForm;

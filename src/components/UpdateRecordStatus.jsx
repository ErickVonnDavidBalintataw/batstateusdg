import React, { useState, useEffect } from "react";
import excelFormula from "excel-formula";
import Swal from "sweetalert2";
import emailjs from "@emailjs/browser";

const UpdateRecordStatus = ({
    selectedSdg,
    selectedYear,
    recordId,
    recordStatus,
    selectedSD,
}) => {
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
    const [status, setStatus] = useState(0); // State for status
    const [notes, setNotes] = useState("");

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
        setInstruments([]);
        setAnswers([]);
        setFormulas([]);
        setUpdatedFormulas([]);
        setSumByQuestionID([]);
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
                    `https://ai-backend-drcx.onrender.com/api/get/sd-office/${selectedSD}`
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

    const handleInputChange = (e, question_id, campus_id) => {
        const { value } = e.target;
        setAnswers((prevAnswers) =>
            prevAnswers.map((answer) =>
                answer.question_id === question_id &&
                answer.campus_id === campus_id
                    ? { ...answer, value: parseFloat(value) || 0 }
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
                    return valueMap[match] !== undefined
                        ? valueMap[match]
                        : match;
                });
            };

            // Updated Formulas with failsafe evaluation
            const updatedFormulasV = uniqueFormulas.map((formulaObj) => {
                const updatedFormula = replaceFormulaValues(
                    formulaObj.formula,
                    valueMap
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

        try {
            // Show confirmation dialog
            const confirmResult = await Swal.fire({
                title: "Are you sure?",
                text: "Do you want to update the status?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, update it!",
                cancelButtonText: "No, cancel!",
            });

            if (!confirmResult.isConfirmed) {
                return; // User canceled the operation
            }

            // Show loading spinner
            Swal.fire({
                title: "Updating...",
                text: "Please wait while the status is being updated.",
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                willOpen: () => {
                    Swal.showLoading();
                },
            });

            // Create a payload with the current status
            const payload = {
                record_id: recordId,
                status: status, // Send the updated status
            };

            const response = await fetch(
                "https://ai-backend-drcx.onrender.com/api/update/status",
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) {
                throw new Error(
                    `Error: ${response.status} ${response.statusText}`
                );
            }

            const result = await response.json();

            Swal.close();

            const userName = localStorage.getItem("name");

            const getStatusMessage = (status, notes = "") => {
                switch (status) {
                    case 1:
                        return `
                      =====================================================
                      RECORD SUBMISSION NOTIFICATION
                      =====================================================
                      
                      Dear Sir/Madam,
          
                      We would like to inform you that an existing record has been marked as **"To Be Approved"**.
          
                      Details of the Updated Record:
                      -------------------------------------
                      - Updated By: ${userName}
                      - Record ID: ${recordId}

                      
                      Notes from the Reviewer:
                      -------------------------
                      ${notes || "No additional notes provided."}
          
                      Kindly review the record and take the necessary actions.
          
                      Best regards,  
                      Campus Sustainable Development Office (CSDO)
                    `;
                    case 2:
                        return `
                      =====================================================
                      RECORD REVISION NOTIFICATION
                      =====================================================
                      
                      Dear Sir/Madam,
          
                      We would like to notify you that an existing record has been marked as **"To Be Revised"**.
          
                      Details of the Updated Record:
                      -------------------------------------
                      - Updated By: ${userName}
                      - Record ID: ${recordId}
                      
                      Notes from the Reviewer:
                      -------------------------
                      ${notes || "No additional notes provided."}
          
                      Please address the required changes and resubmit the record for further review.
          
                      Best regards,  
                      Campus Sustainable Development Office (CSDO)
                    `;
                    case 3:
                        return `
                      =====================================================
                      RECORD APPROVAL NOTIFICATION
                      =====================================================
                      
                      Dear Sir/Madam,
          
                      We are pleased to inform you that an existing record has been marked as **"Approved"**.
          
                      Details of the Updated Record:
                      -------------------------------------
                      - Updated By: ${userName}
                      - Record ID: ${recordId}
          
                      This record is now finalized and requires no further actions.
          
                      Best regards,  
                      Sustainable Development Office (SDO)
                    `;
                    default:
                        return `
                      =====================================================
                      RECORD STATUS UPDATE
                      =====================================================
                      
                      Dear Sir/Madam,
          
                      The status of an existing record has been updated.
          
                      Details of the Updated Record:
                      -------------------------------------
                      - Updated By: ${userName}
                      - Record ID: ${recordId}

                      
                      Notes from the Reviewer:
                      -------------------------
                      ${notes || "No additional notes provided."}
          
                      Kindly check the record for further information.
          
                      Best regards,  
                      Campus Sustainable Development Office (CSDO)
                    `;
                }
            };

            try {
                const message = getStatusMessage(status, notes);

                // Send the email
                await emailjs.send(
                    "service_84tcmsn",
                    "template_oj00ezl",
                    {
                        to_email: "justmyrgutierrez92@gmail.com",
                        subject: "Record Status Update Notification",
                        message,
                    },
                    "F6fJuRNFyTkkvDqbm"
                );

                const getNotificationMessage = (
                    status,
                    recordId,
                    userName,
                    notes = ""
                ) => {
                    switch (status) {
                        case 1:
                            return `The record with ID: ${recordId} has been marked as "To Be Approved" by ${userName}. Please review the record and take the necessary actions.`;
                        case 2:
                            return `The record with ID: ${recordId} has been marked as "To Be Revised" by ${userName}. Notes from the reviewer: ${
                                notes || "No additional notes provided."
                            } Please address the required changes.`;
                        case 3:
                            return `The record with ID: ${recordId} has been marked as "Approved" by ${userName}. This record is now finalized and requires no further actions.`;
                        default:
                            return `The status of the record with ID: ${recordId} has been updated by ${userName}. Please check the record for further information.`;
                    }
                };

                // Create a notification
                await fetch(
                    "https://ai-backend-drcx.onrender.com/api/csd/create-notification",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            userId: localStorage.getItem("user_id"), // User ID from localStorage
                            notificationMessage: getNotificationMessage(
                                status,
                                recordId,
                                userName,
                                notes
                            ),
                        }),
                    }
                );
            } catch (error) {
                console.error("Error sending email or notification:", error);
            }

            // Show success message
            await Swal.fire({
                title: "Success!",
                text: "Status has been updated successfully.",
                icon: "success",
            });

            // Optionally trigger reload or additional logic
            setReload(true); // Refresh data or state as needed
        } catch (error) {
            console.error("Error updating status:", error);

            // Close loading spinner
            Swal.close();

            // Optionally set error state for further handling
            setError("An error occurred while updating the status.");
        }
    };

    const [role, setRole] = useState(null);

    useEffect(() => {
        // Fetch role from localStorage when the component mounts
        const storedRole = localStorage.getItem("role");
        setRole(Number(storedRole)); // Make sure role is treated as a number
    }, []);

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    {instruments.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100"></thead>
                            <tbody className="bg-white divide-y divide-gray-200 text-sm">
                                {instruments.map((instrument) => (
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
                                                                                    {role ===
                                                                                    0 ? (
                                                                                        // If role is 0, display score as text
                                                                                        <span>
                                                                                            {answers.find(
                                                                                                (
                                                                                                    ans
                                                                                                ) =>
                                                                                                    ans.question_id ===
                                                                                                        question.question_id &&
                                                                                                    ans.campus_id ===
                                                                                                        campus.id
                                                                                            )
                                                                                                ?.value ||
                                                                                                0}
                                                                                        </span>
                                                                                    ) : (
                                                                                        // If role is not 0, display input field
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
                                                                                                    campus.id
                                                                                                )
                                                                                            }
                                                                                            className="border rounded p-1 w-[5rem]"
                                                                                        />
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
                                                                    2
                                                                }
                                                                className="border px-4 py-2 text-end whitespace-nowrap align-top"
                                                            >
                                                                <span className="font-semibold mr-2">
                                                                    Score:
                                                                </span>
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
                                                                className="border px-4 py-2"
                                                                colSpan={
                                                                    flattenedCampuses.length +
                                                                    2
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
                                                                            <a
                                                                                href={
                                                                                    evidence.name
                                                                                }
                                                                            ></a>
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
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No instruments available</p>
                    )}
                </div>

                <div className="flex flex-col gap-4">
                    <label htmlFor="status" className="block my-5">
                        Status:
                    </label>
                    <select
                        id="status"
                        onChange={(e) => setStatus(Number(e.target.value))} // Update status on selection
                        className="border rounded p-1 w-[18rem]"
                    >
                        <option value={1} selected={recordStatus === 1}>
                            For Approval
                        </option>
                        <option value={2} selected={recordStatus === 2}>
                            To be Revised
                        </option>
                        <option value={3} selected={recordStatus === 3}>
                            Approved
                        </option>
                    </select>

                    {status === 2 && (
                        <textarea
                            className="textarea border w-[30rem]"
                            placeholder="Enter revision notes here..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    )}
                </div>

                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
                >
                    Submit Status
                </button>
            </form>
        </div>
    );
};

export default UpdateRecordStatus;

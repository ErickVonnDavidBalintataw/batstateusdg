import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faTrash,
    faPlus,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import NotificationSD from "../../components/NotificationSD";

const AddInstrumentPage = () => {
    const [usedID, setUsedID] = useState(["A1"]);

    const [sdgs, setSdgs] = useState([
        { sdg_id: "SDG01", no: 1, title: "No Poverty" },
        { sdg_id: "SDG02", no: 2, title: "Zero Hunger" },
        { sdg_id: "SDG03", no: 3, title: "Good Health and Well-being" },
        { sdg_id: "SDG04", no: 4, title: "Quality Education" },
        { sdg_id: "SDG05", no: 5, title: "Gender Equality" },
        { sdg_id: "SDG06", no: 6, title: "Clean Water and Sanitation" },
        { sdg_id: "SDG07", no: 7, title: "Affordable and Clean Energy" },
        { sdg_id: "SDG08", no: 8, title: "Decent Work and Economic Growth" },
        {
            sdg_id: "SDG09",
            no: 9,
            title: "Industry, Innovation, and Infrastructure",
        },
        { sdg_id: "SDG10", no: 10, title: "Reduced Inequality" },
        {
            sdg_id: "SDG11",
            no: 11,
            title: "Sustainable Cities and Communities",
        },
        {
            sdg_id: "SDG12",
            no: 12,
            title: "Responsible Consumption and Production",
        },
        { sdg_id: "SDG13", no: 13, title: "Climate Action" },
        { sdg_id: "SDG14", no: 14, title: "Life Below Water" },
        { sdg_id: "SDG15", no: 15, title: "Life on Land" },
        {
            sdg_id: "SDG16",
            no: 16,
            title: "Peace, Justice, and Strong Institutions",
        },
        { sdg_id: "SDG17", no: 17, title: "Partnerships for the Goals" },
    ]);

    const navigate = useNavigate();

    useEffect(() => {
        const userId = localStorage.getItem("user_id");
        const role = localStorage.getItem("role");

        if (!userId || !role) {
            navigate("/login");
        }
    }, [navigate]);

    const [instrumentData, setInstrumentData] = useState({
        sdg_id: "",
        subtitles: [
            {
                subtitle: "",
                sections: [
                    {
                        content: "",
                        questions: [
                            {
                                questionId: "A1",
                                questionText: "",
                                questionType: "Number",
                                suffix: "",
                                options: [],
                            },
                        ],
                        formulas: [""],
                    },
                ],
            },
        ],
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setInstrumentData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSectionContentChange = (e, subtitleIndex, sectionIndex) => {
        const { value } = e.target;
        setInstrumentData((prevData) => {
            const updatedSubtitles = [...prevData.subtitles];
            updatedSubtitles[subtitleIndex].sections[sectionIndex].content =
                value;
            return {
                ...prevData,
                subtitles: updatedSubtitles,
            };
        });
    };

    // const generateQuestionId = (sectionIndex, questionIndex) => {
    //     // Determine the letter prefix based on the section index
    //     const sectionPrefix = String.fromCharCode(
    //         "A".charCodeAt(0) + questionIndex
    //     );

    //     // Append the section index + 1 as the number
    //     return `${sectionPrefix}${sectionIndex + 1}`;
    // };

    const generateQuestionId = (sectionIndex, questionIndex) => {
        // Determine the letter prefix based on the section index
        const sectionPrefix = String.fromCharCode(
            "A".charCodeAt(0) + (sectionIndex % 26)
        );

        // Initialize the state for the section prefix if it doesn't exist
        setUsedID((prevUsedID) => {
            const updatedUsedID = { ...prevUsedID };
            if (!updatedUsedID[sectionPrefix]) {
                updatedUsedID[sectionPrefix] = [];
            }

            // Add the current question index to the section prefix's list
            if (!updatedUsedID[sectionPrefix].includes(questionIndex + 1)) {
                updatedUsedID[sectionPrefix].push(questionIndex + 1);
            }

            return updatedUsedID;
        });

        // Return the unique ID
        return `${sectionPrefix}${questionIndex + 1}`;
    };

    const removeSection = (subtitleIndex, sectionIndex) => {
        setInstrumentData((prevData) => {
            const updatedSubtitles = prevData.subtitles.map((subtitle, idx) =>
                idx === subtitleIndex
                    ? {
                          ...subtitle,
                          sections: subtitle.sections.filter(
                              (_, i) => i !== sectionIndex
                          ),
                      }
                    : subtitle
            );

            return {
                ...prevData,
                subtitles: updatedSubtitles,
            };
        });
    };

    const addSection = (subtitleIndex) => {
        setInstrumentData((prevData) => {
            const updatedSubtitles = prevData.subtitles.map((subtitle, idx) =>
                idx === subtitleIndex
                    ? {
                          ...subtitle,
                          sections: [
                              ...subtitle.sections,
                              {
                                  content: "",
                                  questions: [
                                      {
                                          questionId: generateQuestionId(
                                              subtitle.sections.length,
                                              0
                                          ),
                                          questionText: "",
                                          questionType: "Number",
                                          suffix: "",
                                          options: [],
                                      },
                                  ],
                                  formulas: [""],
                              },
                          ],
                      }
                    : subtitle
            );

            return {
                ...prevData,
                subtitles: updatedSubtitles,
            };
        });
    };

    const handleQuestionChange = (
        e,
        subtitleIndex,
        sectionIndex,
        questionIndex
    ) => {
        const { name, value } = e.target;

        setInstrumentData((prevData) => ({
            ...prevData,
            subtitles: prevData.subtitles.map((subtitle, subIndex) =>
                subIndex === subtitleIndex
                    ? {
                          ...subtitle,
                          sections: subtitle.sections.map((section, secIndex) =>
                              secIndex === sectionIndex
                                  ? {
                                        ...section,
                                        questions: section.questions.map(
                                            (question, qIndex) =>
                                                qIndex === questionIndex
                                                    ? {
                                                          ...question,
                                                          [name]: value,
                                                      }
                                                    : question
                                        ),
                                    }
                                  : section
                          ),
                      }
                    : subtitle
            ),
        }));
    };

    const addQuestion = (sectionIndex) => {
        setInstrumentData((prevData) => ({
            ...prevData,
            sections: prevData.sections.map((section, idx) =>
                idx === sectionIndex
                    ? {
                          ...section,
                          questions: [
                              ...section.questions,
                              {
                                  questionId: generateQuestionId(
                                      sectionIndex,
                                      section.questions.length
                                  ),
                                  questionText: "",
                                  questionType: "Number",
                                  suffix: "",
                                  options: [],
                              },
                          ],
                      }
                    : section
            ),
        }));
    };

    // Remove a question from a specific section dynamically
    const removeQuestion = (sectionIndex, questionIndex) => {
        setInstrumentData((prevData) => {
            const updatedSections = [...prevData.sections];
            updatedSections[sectionIndex].questions = updatedSections[
                sectionIndex
            ].questions.filter((_, i) => i !== questionIndex);

            return {
                ...prevData,
                sections: updatedSections,
            };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
    };

    return (
        <section className="h-screen flex">
            <Sidebar />
            <main className="h-full w-[80%] border overflow-auto">
                <div className="header py-5 px-7 flex justify-between items-center">
                    <h1 className="text-2xl text-gray-900">Add Instruments</h1>
                    <div className="flex gap-2">
                        <Link
                            to="/csd/instruments"
                            className="bg-blue-600 text-white text-base px-6 py-2"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} /> Back
                        </Link>
                        <NotificationSD />
                    </div>
                </div>
                <hr />
                <div className="py-5 px-7">
                    <form onSubmit={handleSubmit}>
                        <div className="border border-gray-500 rounded-md shadow px-3 py-5 flex gap-4">
                            <div className="input-group mb-4">
                                <label className="form-control w-full">
                                    <div className="label">
                                        <span className="label-text">
                                            Select an SDG
                                        </span>
                                    </div>
                                    <select
                                        name="sdg_id"
                                        className="form__input border mt-1 block p-2 rounded-md shadow-sm sm:text-sm focus:outline-none w-full"
                                        value={instrumentData.sdg_id}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select an SDG</option>
                                        {sdgs.map((sdg) => (
                                            <option
                                                key={sdg.sdg_id}
                                                value={sdg.sdg_id}
                                            >
                                                {sdg.no}: {sdg.title}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                        </div>
                        <hr className="my-4" />
                        <div className="border px-3 py-2">
                            {instrumentData.subtitles.map(
                                (subtitle, subtitleIndex) => (
                                    <div key={subtitleIndex} className="mb-4">
                                        <label className="form-control w-full">
                                            <div className="label">
                                                <span className="label-text">
                                                    Subtitle
                                                </span>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Enter subtitle"
                                                className="form__input border mt-1 block p-2 rounded-md shadow-sm sm:text-sm focus:outline-none w-full"
                                                value={subtitle.subtitle}
                                                onChange={(e) =>
                                                    setInstrumentData(
                                                        (prevData) => {
                                                            const updatedSubtitles =
                                                                [
                                                                    ...prevData.subtitles,
                                                                ];
                                                            updatedSubtitles[
                                                                subtitleIndex
                                                            ].subtitle =
                                                                e.target.value;
                                                            return {
                                                                ...prevData,
                                                                subtitles:
                                                                    updatedSubtitles,
                                                            };
                                                        }
                                                    )
                                                }
                                            />
                                        </label>
                                        <div className="mt-2">
                                            {subtitle.sections.map(
                                                (section, sectionIndex) => (
                                                    <div className="border p-4">
                                                        <div
                                                            key={sectionIndex}
                                                            className="flex items-center gap-2 mb-2"
                                                        >
                                                            <input
                                                                type="text"
                                                                placeholder="Enter section content"
                                                                className="form__input border mt-1 block p-2 rounded-md shadow-sm sm:text-sm focus:outline-none w-full"
                                                                value={
                                                                    section.content
                                                                }
                                                                onChange={(e) =>
                                                                    handleSectionContentChange(
                                                                        e,
                                                                        subtitleIndex,
                                                                        sectionIndex
                                                                    )
                                                                }
                                                            />
                                                            <button
                                                                type="button"
                                                                className="text-red-600"
                                                                onClick={() =>
                                                                    removeSection(
                                                                        subtitleIndex,
                                                                        sectionIndex
                                                                    )
                                                                }
                                                            >
                                                                <FontAwesomeIcon
                                                                    icon={
                                                                        faTrash
                                                                    }
                                                                />
                                                            </button>
                                                        </div>
                                                        {section.questions.map(
                                                            (
                                                                question,
                                                                qIdx
                                                            ) => (
                                                                <div
                                                                    key={
                                                                        question.questionId
                                                                    }
                                                                >
                                                                    <input
                                                                        value={
                                                                            question.questionText
                                                                        }
                                                                        onChange={
                                                                            (
                                                                                e
                                                                            ) =>
                                                                                handleQuestionChange(
                                                                                    e,
                                                                                    idx,
                                                                                    qIdx
                                                                                ) // Handle question text change
                                                                        }
                                                                    />
                                                                    <button
                                                                        onClick={() =>
                                                                            removeQuestion(
                                                                                idx,
                                                                                qIdx
                                                                            )
                                                                        }
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                </div>
                                                            )
                                                        )}
                                                        <button
                                                            onClick={() =>
                                                                addQuestion(idx)
                                                            }
                                                        >
                                                            Add Question
                                                        </button>
                                                    </div>
                                                )
                                            )}
                                            <button
                                                type="button"
                                                className="text-blue-600 text-sm mt-2"
                                                onClick={() =>
                                                    addSection(subtitleIndex)
                                                }
                                            >
                                                <FontAwesomeIcon
                                                    icon={faPlus}
                                                />{" "}
                                                Add Section
                                            </button>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                        <hr />
                        <button
                            type="submit"
                            className="bg-blue-600 text-white text-sm float-end px-6 py-2 my-2"
                        >
                            Submit
                        </button>
                    </form>
                </div>
            </main>
        </section>
    );
};

export default AddInstrumentPage;

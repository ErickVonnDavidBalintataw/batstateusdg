import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { useNavigate, Link } from "react-router-dom"; // Import useNavigate
//import FontAwesomeIcon
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faTrash } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import NotificationSD from "../../components/NotificationSD";
import ExcelFormulaModal from "../../components/Tester";

const AddInstrumentPage = () => {
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

  const [usedID, setUsedID] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    const role = localStorage.getItem("role");

    if (!userId || !role) {
      navigate("/login");
    }
  }, [navigate]);

  const [instrumentData, setInstrumentData] = useState({
    //final version
    sdg_id: "",
    subtitles: [
      {
        subtitle: "",
        sections: [
          {
            content: "",
            questions: [
              {
                questionId: "",
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

  // const addSubtitle = () => {
  //   setInstrumentData((prevState) => ({
  //     ...prevState,
  //     subtitles: [
  //       ...prevState.subtitles,
  //       {
  //         subtitle: "",
  //         sections: [
  //           {
  //             content: "",
  //             questions: [
  //               {
  //                 questionId: "",
  //                 questionText: "",
  //                 questionType: "Number",
  //                 suffix: "",
  //                 options: [],
  //               },
  //             ],
  //             formulas: [""],
  //           },
  //         ],
  //       },
  //     ],
  //   }));
  // };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInstrumentData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleInputSubChange = (e, index) => {
    const { value } = e.target;

    setInstrumentData((prevData) => {
      const updatedSubtitles = [...prevData.subtitles];
      updatedSubtitles[index] = {
        ...updatedSubtitles[index],
        subtitle: value,
      };

      return {
        ...prevData,
        subtitles: updatedSubtitles,
      };
    });
  };

  const handleSectionContentChange = (e, subtitleIndex, sectionIndex) => {
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
                      [name]: value, // Update only the `content` field
                      questions: section.questions.map((question) => ({
                        ...question, // Ensure questions remain unaffected
                      })),
                    }
                  : section
              ),
            }
          : subtitle
      ),
    }));
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
                      questions: section.questions.map((question, qIndex) =>
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

  const handleQuestionTypeChange = (
    e,
    subtitleIndex,
    sectionIndex,
    questionIndex
  ) => {
    const { value } = e.target;

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
                      questions: section.questions.map((question, qIndex) =>
                        qIndex === questionIndex
                          ? {
                              ...question,
                              questionType: value,
                              suffix: "",
                              options: [],
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
  // Effect to generate Question IDs when instrumentData changes
  useEffect(() => {
    if (instrumentData && instrumentData.subtitles) {
      console.log(instrumentData, "instrument");
      // Generate Question IDs for all sections after the data change
      generateQuestionIdsForAllSections(instrumentData);
    }
  }, [instrumentData]);

  // Function to generate Question IDs for all sections in instrumentData
  const generateQuestionIdsForAllSections = (data) => {
    data.subtitles.forEach((subtitle, subtitleIndex) => {
      subtitle.sections.forEach((section, sectionIndex) => {
        section.questions.forEach((question, questionIndex) => {
          // Generate a unique question ID and assign it to each question
          const questionId = generateQuestionId(
            subtitleIndex,
            sectionIndex,
            questionIndex
          );
          question.questionId = questionId; // Assign generated ID to question
        });
      });
    });
  };

  // Function to generate a unique question ID based on subtitle, section, and question indices
  const generateQuestionId = (subtitleIndex, sectionIndex, questionIndex) => {
    // Determine the letter prefix based on the subtitle index (A, B, C, ...)
    const sectionPrefix = String.fromCharCode(
      "A".charCodeAt(0) + subtitleIndex
    );

    // Initialize the state for the section prefix if it doesn't exist
    setUsedID((prevUsedID) => {
      const updatedUsedID = { ...prevUsedID };

      // Ensure the sectionPrefix array exists
      if (!updatedUsedID[sectionPrefix]) {
        updatedUsedID[sectionPrefix] = [];
      }

      // Add the current question index to the section prefix's list, ensuring it's unique
      if (!updatedUsedID[sectionPrefix].includes(questionIndex + 1)) {
        updatedUsedID[sectionPrefix].push(questionIndex + 1);
      }

      return updatedUsedID;
    });

    // Return the unique ID for the question
    return `${sectionPrefix}${questionIndex + 1}`;
  };

  // Function to add a new subtitle
  const addSubtitle = () => {
    setInstrumentData((prevData) => {
      // Create a new subtitle object
      const newSubtitle = {
        sections: [
          {
            questions: [
              {
                questionId: "",
                questionText: "New Question",
                questionType: "Number",
                suffix: "",
                options: [],
              },
            ],
          },
        ],
      };

      // Add the new subtitle at the end
      return {
        ...prevData,
        subtitles: [...prevData.subtitles, newSubtitle],
      };
    });
  };

  // Function to add a new section in the specified subtitle
  const addSection = (subtitleIndex) => {
    setInstrumentData((prevData) => {
      const updatedSubtitles = prevData.subtitles.map((subtitle, idx) => {
        if (idx === subtitleIndex) {
          // Add the new section to the selected subtitle
          return {
            ...subtitle,
            sections: [
              ...subtitle.sections,
              {
                content: "",
                questions: [
                  {
                    questionId: "",
                    questionText: "",
                    questionType: "Number",
                    suffix: "",
                    options: [],
                  },
                ],
                formulas: [""],
              },
            ],
          };
        }
        return subtitle;
      });

      return {
        ...prevData,
        subtitles: updatedSubtitles,
      };
    });
  };

  const removeSection = (index) => {
    const updatedSections = instrumentData.sections.filter(
      (_, i) => i !== index
    );
    setInstrumentData((prevData) => ({
      ...prevData,
      sections: updatedSections,
    }));
  };

  const handleOptionChange = (
    e,
    subtitleIndex,
    sectionIndex,
    questionIndex,
    optionIndex
  ) => {
    const { value } = e.target;

    setInstrumentData((prevData) => {
      const updatedSubtitles = [...prevData.subtitles];

      const targetSubtitle = { ...updatedSubtitles[subtitleIndex] };
      const updatedSections = [...targetSubtitle.sections];
      const targetSection = { ...updatedSections[sectionIndex] };
      const updatedQuestions = [...targetSection.questions];
      const targetQuestion = { ...updatedQuestions[questionIndex] };

      // Update the specific option
      const updatedOptions = [...targetQuestion.options];
      updatedOptions[optionIndex] = value;

      targetQuestion.options = updatedOptions;
      updatedQuestions[questionIndex] = targetQuestion;
      targetSection.questions = updatedQuestions;
      updatedSections[sectionIndex] = targetSection;
      targetSubtitle.sections = updatedSections;
      updatedSubtitles[subtitleIndex] = targetSubtitle;

      return { ...prevData, subtitles: updatedSubtitles };
    });
  };

  const addQuestion = (subtitleIndex, sectionIndex) => {
    setInstrumentData((prevData) => ({
      ...prevData,
      subtitles: prevData.subtitles.map((subtitle, subIdx) =>
        subIdx === subtitleIndex
          ? {
              ...subtitle,
              sections: subtitle.sections.map((section, secIdx) =>
                secIdx === sectionIndex
                  ? {
                      ...section,
                      questions: [
                        ...section.questions,
                        {
                          questionId: "",
                          questionText: "",
                          questionType: "Number",
                          suffix: "",
                          options: [],
                        },
                      ],
                    }
                  : section
              ),
            }
          : subtitle
      ),
    }));
  };

  const removeQuestion = (sectionIndex, questionIndex) => {
    const updatedSections = [...instrumentData.sections];
    updatedSections[sectionIndex].questions = updatedSections[
      sectionIndex
    ].questions.filter((_, i) => i !== questionIndex);
    setInstrumentData((prevData) => ({
      ...prevData,
      sections: updatedSections,
    }));
  };

  const addOption = (subtitleIndex, sectionIndex, questionIndex) => {
    setInstrumentData((prevData) => {
      const updatedSubtitles = [...prevData.subtitles];

      // Deeply clone the specific subtitle
      const targetSubtitle = { ...updatedSubtitles[subtitleIndex] };

      // Clone the sections array
      const updatedSections = [...targetSubtitle.sections];

      // Clone the specific section
      const targetSection = { ...updatedSections[sectionIndex] };

      // Clone the specific question
      const updatedQuestions = [...targetSection.questions];
      const targetQuestion = { ...updatedQuestions[questionIndex] };

      // Add a new option
      targetQuestion.options = [...targetQuestion.options, ""];

      // Update the questions array
      updatedQuestions[questionIndex] = targetQuestion;

      // Update the section
      targetSection.questions = updatedQuestions;

      // Update the sections array
      updatedSections[sectionIndex] = targetSection;

      // Update the subtitle
      targetSubtitle.sections = updatedSections;

      // Update the subtitles array
      updatedSubtitles[subtitleIndex] = targetSubtitle;

      return { ...prevData, subtitles: updatedSubtitles };
    });
  };

  const removeOption = (
    subtitleIndex,
    sectionIndex,
    questionIndex,
    optionIndex
  ) => {
    setInstrumentData((prevData) => {
      const updatedSubtitles = [...prevData.subtitles];

      const targetSubtitle = { ...updatedSubtitles[subtitleIndex] };
      const updatedSections = [...targetSubtitle.sections];
      const targetSection = { ...updatedSections[sectionIndex] };
      const updatedQuestions = [...targetSection.questions];
      const targetQuestion = { ...updatedQuestions[questionIndex] };

      // Remove the specific option
      const updatedOptions = targetQuestion.options.filter(
        (_, i) => i !== optionIndex
      );

      targetQuestion.options = updatedOptions;
      updatedQuestions[questionIndex] = targetQuestion;
      targetSection.questions = updatedQuestions;
      updatedSections[sectionIndex] = targetSection;
      targetSubtitle.sections = updatedSections;
      updatedSubtitles[subtitleIndex] = targetSubtitle;

      return { ...prevData, subtitles: updatedSubtitles };
    });
  };

  const addFormula = (sectionIndex) => {
    setInstrumentData((prevData) => ({
      ...prevData,
      sections: prevData.sections.map((section, idx) =>
        idx === sectionIndex
          ? {
              ...section,
              formulas: [...section.formulas, ""], // Add an empty formula
            }
          : section
      ),
    }));
  };

  const handleFormulaChange = (
    e,
    subtitleIndex,
    sectionIndex,
    formulaIndex
  ) => {
    const { value } = e.target;

    setInstrumentData((prevData) => ({
      ...prevData,
      subtitles: prevData.subtitles.map((subtitle, subIdx) =>
        subIdx === subtitleIndex
          ? {
              ...subtitle,
              sections: subtitle.sections.map((section, secIdx) =>
                secIdx === sectionIndex
                  ? {
                      ...section,
                      formulas: section.formulas.map((formula, formIdx) =>
                        formIdx === formulaIndex ? value : formula
                      ),
                    }
                  : section
              ),
            }
          : subtitle
      ),
    }));
  };

  const removeFormula = (sectionIndex, formulaIndex) => {
    const updatedSections = [...instrumentData.sections];
    updatedSections[sectionIndex].formulas = updatedSections[
      sectionIndex
    ].formulas.filter((_, i) => i !== formulaIndex);
    setInstrumentData((prevData) => ({
      ...prevData,
      sections: updatedSections,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Show confirmation dialog
    const result = await Swal.fire({
      title: "Submit Instrument?",
      text: "Are you sure you want to submit this instrument data?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, submit it!",
      cancelButtonText: "No, cancel!",
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return; // User canceled the submission
    }

    // Show loading indicator
    Swal.fire({
      title: "Submitting...",
      text: "Please wait while the instrument is being submitted.",
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      for (const subtitle of instrumentData.subtitles) {
        // Submit the subtitle
        const subtitleResponse = await fetch(
          "https://ai-backend-drcx.onrender.com/api/add/instruments",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sdg_id: instrumentData.sdg_id,
              subtitle: subtitle.subtitle,
            }),
          }
        );

        if (!subtitleResponse.ok) {
          throw new Error("Failed to submit subtitle.");
        }

        const subtitleData = await subtitleResponse.json();

        for (const section of subtitle.sections) {
          // Submit the section
          const sectionResponse = await fetch(
            "https://ai-backend-drcx.onrender.com/api/add/sections",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                section_content: section.content,
                instrument_id: subtitleData.instrument_id,
              }),
            }
          );

          if (!sectionResponse.ok) {
            throw new Error("Failed to submit section.");
          }

          const sectionData = await sectionResponse.json();

          for (const question of section.questions) {
            // Submit the question
            const questionResponse = await fetch(
              "https://ai-backend-drcx.onrender.com/api/add/questions",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  question: question.questionText,
                  type: question.questionType,
                  suffix: question.suffix,
                  sub_id: question.questionId,
                  section_id: sectionData.section_id,
                }),
              }
            );

            if (!questionResponse.ok) {
              throw new Error("Failed to submit question.");
            }

            const questionData = await questionResponse.json();

            // Submit options if the question type is "Multiple Options"
            if (question.questionType === "Multiple Options") {
              for (const option of question.options) {
                const optionResponse = await fetch(
                  "https://ai-backend-drcx.onrender.com/api/add/options",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      option,
                      question_id: questionData.question_id,
                    }),
                  }
                );

                if (!optionResponse.ok) {
                  throw new Error("Failed to submit options.");
                }
              }
            }
          }

          // Submit formulas for the section
          for (const formula of section.formulas) {
            const formulaResponse = await fetch(
              "https://ai-backend-drcx.onrender.com/api/add/formulas",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  formula,
                  section_id: sectionData.section_id,
                }),
              }
            );

            if (!formulaResponse.ok) {
              throw new Error("Failed to submit formulas.");
            }
          }
        }
      }

      // Close loading spinner
      Swal.close();

      // Show success message
      Swal.fire({
        title: "Success!",
        text: "The instrument has been submitted successfully.",
        icon: "success",
      });

      navigate("/csd/instruments");
    } catch (error) {
      console.error("Error submitting instrument data:", error);

      // Close loading spinner
      Swal.close();

      // Show error message
      Swal.fire({
        title: "Error",
        text: "An error occurred while submitting the instrument. Please try again.",
        icon: "error",
      });
    }
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
            <ExcelFormulaModal />
          </div>
        </div>
        <hr />
        <div className="py-5 px-7">
          <form onSubmit={handleSubmit}>
            <div className="border border-gray-500 rounded-md shadow px-3 py-5 flex gap-4">
              <div className="input-group mb-4">
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text">Select an SDG</span>
                  </div>
                  <select
                    name="sdg_id"
                    className="form__input border mt-1 block p-2 rounded-md shadow-sm sm:text-sm focus:outline-none w-full"
                    value={instrumentData.sdg_id}
                    onChange={handleInputChange}
                  >
                    <option value="">Select an SDG</option>
                    {sdgs.map((sdg) => (
                      <option key={sdg.sdg_id} value={sdg.sdg_id}>
                        {sdg.no}: {sdg.title}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {/* <div className="input-group mb-4 w-1/2">
                                <label className="form-control w-full">
                                    <div className="label">
                                        <span className="label-text">
                                            Subtitle
                                        </span>
                                    </div>
                                    <input
                                        type="text"
                                        name="subtitle"
                                        placeholder="Enter subtitle"
                                        className="form__input border mt-1 block w-full p-2 rounded-md shadow-sm sm:text-sm focus:outline-none "
                                        value={instrumentData.subtitle}
                                        onChange={handleInputChange}
                                        required={true}
                                    />
                                </label>
                            </div> */}
            </div>
            <hr className="my-4" />
            <div className="border px-3 py-2">
              {instrumentData.subtitles.map((subtitle, subtitleIndex) => (
                <div className="input-group mb-4" key={subtitleIndex}>
                  <label className="form-control w-full">
                    <div className="label">
                      <span className="label-text">Subtitle</span>
                    </div>
                    <input
                      type="text"
                      name="subtitle"
                      placeholder="Enter subtitle"
                      className="form__input border mt-1 block w-full p-2 rounded-md shadow-sm sm:text-sm focus:outline-none"
                      value={subtitle.subtitle}
                      onChange={(e) => handleInputSubChange(e, subtitleIndex)}
                      required={true}
                    />
                  </label>
                  {subtitle.sections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="section-group my-4">
                      <hr
                        className={`${
                          sectionIndex === 0 ? "hidden my-4" : "my-4"
                        }`}
                      />
                      <div className="flex gap-2 justify-between items-end">
                        <div className="input-group w-[80%]">
                          <label className="form-control w-full">
                            <div className="label">
                              <span className="label-text">Content</span>
                            </div>
                          </label>
                          <input
                            name="content"
                            value={
                              instrumentData.subtitles[subtitleIndex].sections[
                                sectionIndex
                              ].content
                            }
                            onChange={(e) =>
                              handleSectionContentChange(
                                e,
                                subtitleIndex,
                                sectionIndex
                              )
                            }
                            className="form__input border mt-1 block w-full p-2 rounded-md shadow-sm sm:text-sm focus:outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          className="bg-blue-600 text-white text-sm px-6 py-2 mt-2 h-fit"
                          onClick={() => removeSection(sectionIndex)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                      {section.questions.map((question, questionIndex) => (
                        <div
                          key={questionIndex}
                          className="question-group my-4"
                        >
                          <div className="flex gap-2 items-end">
                            <div className="input-group w-[80%]">
                              <label className="form-control w-full">
                                <div className="label">
                                  <span className="label-text">
                                    {question.questionId}. Question{" "}
                                  </span>
                                </div>
                                <input
                                  name="questionText"
                                  value={
                                    instrumentData.subtitles[subtitleIndex]
                                      .sections[sectionIndex].questions[
                                      questionIndex
                                    ].questionText
                                  }
                                  onChange={(e) =>
                                    handleQuestionChange(
                                      e,
                                      subtitleIndex,
                                      sectionIndex,
                                      questionIndex
                                    )
                                  }
                                  className="form__input border mt-1 block w-full p-2 rounded-md shadow-sm sm:text-sm focus:outline-none"
                                />
                              </label>
                            </div>

                            <div className="input-group w-[20%]">
                              <label className="form-control w-full max-w-xs">
                                <div className="label">
                                  <span className="label-text">
                                    Question Type
                                  </span>
                                </div>
                                <select
                                  value={
                                    instrumentData.subtitles[subtitleIndex]
                                      .sections[sectionIndex].questions[
                                      questionIndex
                                    ].questionType
                                  }
                                  onChange={(e) =>
                                    handleQuestionTypeChange(
                                      e,
                                      subtitleIndex,
                                      sectionIndex,
                                      questionIndex
                                    )
                                  }
                                  className="form__input border mt-1 block w-full p-2 rounded-md shadow-sm sm:text-sm focus:outline-none"
                                >
                                  <option value="Number">Number</option>
                                  <option value="Text">Text</option>
                                  <option value="Multiple Options">
                                    Multiple Options
                                  </option>
                                </select>
                              </label>
                            </div>

                            <button
                              type="button"
                              className="bg-blue-600 text-white text-sm px-6 py-2 mt-2"
                              onClick={() =>
                                removeQuestion(sectionIndex, questionIndex)
                              }
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                          {question.questionType === "Multiple Options" && (
                            <div className="input-group">
                              <label className="form-control w-[10%]">
                                <div className="label">
                                  <span className="label-text">Options</span>
                                </div>
                                {question.options.map((option, optionIndex) => (
                                  <div
                                    key={optionIndex}
                                    className="flex gap-2 items-center mt-2"
                                  >
                                    {/* Input for Option Text */}
                                    <input
                                      type="text"
                                      placeholder="Enter option"
                                      className="form__input border mt-1 block px-3 py-2 rounded-md shadow-sm sm:text-sm focus:outline-none w-full"
                                      value={option}
                                      onChange={(e) =>
                                        handleOptionChange(
                                          e,
                                          subtitleIndex,
                                          sectionIndex,
                                          questionIndex,
                                          optionIndex
                                        )
                                      }
                                    />
                                    {/* Button to Remove Option */}
                                    <button
                                      type="button"
                                      className="bg-red-500 text-white text-sm px-4 py-1 rounded"
                                      onClick={() =>
                                        removeOption(
                                          subtitleIndex,
                                          sectionIndex,
                                          questionIndex,
                                          optionIndex
                                        )
                                      }
                                    >
                                      <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                  </div>
                                ))}
                                {/* Button to Add Option */}
                                <button
                                  type="button"
                                  className="bg-blue-600 text-white text-sm px-4 py-2 mt-2 rounded"
                                  onClick={() =>
                                    addOption(
                                      subtitleIndex,
                                      sectionIndex,
                                      questionIndex
                                    )
                                  }
                                >
                                  Add Option
                                </button>
                              </label>
                            </div>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        className="bg-blue-600 text-white text-sm px-6 py-2 mb-4 h-fit"
                        onClick={() => addQuestion(subtitleIndex, sectionIndex)}
                      >
                        Add Question
                      </button>
                      {section.formulas &&
                        section.formulas.map((formula, formulaIndex) => (
                          <div
                            key={formulaIndex}
                            className="formula-group my-2"
                          >
                            <div className="input-group w-full">
                              <label className="form-control w-full">
                                <div className="label">
                                  <span className="label-text">Formula</span>
                                </div>
                                <div className="flex gap-2">
                                  <textarea
                                    placeholder="Enter formula"
                                    className="form__input border mt-1 block px-3 py-4 rounded-md shadow-sm sm:text-sm focus:outline-none w-full h-32"
                                    value={formula}
                                    onChange={(e) =>
                                      handleFormulaChange(
                                        e,
                                        subtitleIndex,
                                        sectionIndex,
                                        formulaIndex
                                      )
                                    }
                                  />
                                  <button
                                    type="button"
                                    className="bg-blue-600 text-white text-sm px-6 py-2 mt-2 h-fit"
                                    onClick={() =>
                                      removeFormula(sectionIndex, formulaIndex)
                                    }
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </button>
                                </div>
                              </label>
                            </div>
                          </div>
                        ))}
                      <button
                        type="button"
                        className="bg-blue-600 text-white text-sm px-6 py-2 mt-2"
                        onClick={() => addFormula(sectionIndex)}
                      >
                        Add Formula
                      </button>
                    </div>
                  ))}
                  <hr />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="bg-blue-600 text-white text-sm px-6 py-2 my-4 h-fit"
                      onClick={() => addSection(subtitleIndex)}
                    >
                      Add Section
                    </button>
                    <button
                      type="button"
                      onClick={addSubtitle}
                      className="bg-blue-600 text-white text-sm px-6 py-2 my-4 h-fit"
                    >
                      Add Subtitle
                    </button>
                  </div>
                </div>
              ))}
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

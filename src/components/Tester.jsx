import React, { useState } from "react";
import "tailwindcss/tailwind.css";
import excelFormula from "excel-formula";

const ExcelFormulaModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formula, setFormula] = useState("");
  const [result, setResult] = useState("");

  const handleChange = (event) => {
    setFormula(event.target.value);
  };

  const convertAndEvaluate = () => {
    try {
      const jsFormula = excelFormula.toJavaScript(formula);
      console.log("Converted JS Formula:", jsFormula);
      const evaluatedResult = eval(jsFormula);
      setResult(evaluatedResult);
    } catch (error) {
      setResult("Error: " + error.message);
    }
  };

  return (
    <div>
      {/* Button to open the modal */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition duration-200"
      >
        Open Excel Formula Converter
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h1 className="text-3xl font-semibold text-center text-indigo-600 mb-6">
              Excel Formula to JavaScript Converter
            </h1>

            {/* Input for Excel Formula */}
            <div className="mb-4">
              <label
                htmlFor="excelFormula"
                className="block text-gray-700 text-lg mb-2"
              >
                Enter Excel Formula:
              </label>
              <input
                type="text"
                id="excelFormula"
                value={formula}
                onChange={handleChange}
                placeholder="e.g., IF(1+1=2, 'true', 'false')"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Button to convert and evaluate */}
            <button
              onClick={convertAndEvaluate}
              className="bg-blue-600 text-white text-base px-6 py-2"
            >
              Convert and Evaluate
            </button>

            {/* Display Result */}
            <h3 className="text-xl mt-6 mb-2 text-gray-800">Result:</h3>
            <p
              id="result"
              className="p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-800"
            >
              {result}
            </p>

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="mt-4 py-2 px-4 bg-red-600 text-white rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelFormulaModal;

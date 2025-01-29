#include <iostream>
#include <string>
#include <cctype>
using namespace std;

//Step 4: The user are asked to answer a question
int Question(const string &question) {
    //Step 5: Declare variable to store the answer
    int choice;
    do {
        // Step 6: Enter answer from 1 to 5, if any other number is entered it will notify te user that the answer is incorrect and re run the loop again
        // Note: if the user answer is from 1-5, it will break the loop and will proceed to Step 7 below.
        cout << question << "\n1. Strongly Disagree\n2. Disagree\n3. Neutral\n4. Agree\n5. Strongly Agree\nEnter your choice (1-5): ";
        cin >> choice;
        if (choice < 1 || choice > 5) {
            cout << "Invalid choice. Please enter a number between 1 and 5.\n";
        }
    } while (choice < 1 || choice > 5);
    return choice;
}

//Step 9: Calculate the scores:
char calculate(int score, char option1, char option2) {
    return (score >= 12) ? option1 : option2; // This one is called ternary operator. This is basically if and the statement
    // (score >= 12) is the condition
    // return option 1, if the condition is true
    // else option 2 if the consition is false
    
    //This is the version for "if statement"
    // if(score >= 12){
    //     return option1
    // }else{
    //     return option2
    // }
}

//Step 13: Return the matching compatibility type
string Compatibility(const string &type) {
    if (type == "ISTJ") return "ESTP, ESFP";
    if (type == "ISFJ") return "ESFP, ESTP";
    if (type == "INFJ") return "ENFP, ENTP";
    if (type == "INTJ") return "ENTP, ENFP";
    if (type == "ISTP") return "ESFJ, ESTJ";
    if (type == "ISFP") return "ESFJ, ENFJ";
    if (type == "INFP") return "ENFJ, ENTJ";
    if (type == "INTP") return "ENTJ, ESTJ";
    if (type == "ESTP") return "ISTJ, ISFJ";
    if (type == "ESFP") return "ISTJ, ISFJ";
    if (type == "ENFP") return "INFJ, INTJ";
    if (type == "ENTP") return "INFJ, INTJ";
    if (type == "ESTJ") return "ISTP, ISFP";
    if (type == "ESFJ") return "ISFP, ISTP";
    if (type == "ENFJ") return "INFP, ISFP";
    if (type == "ENTJ") return "INTP, INFP";
    return "No suggestions available.";
}

// Step 15: Return the matching compatibility type
string Career(const string &type) {
    if (type == "ISTJ") return "Auditor, Engineer, Lawyer, Accountant.";
    if (type == "ISFJ") return "Nurse, Teacher, Office Manager, Social Worker.";
    if (type == "INFJ") return "Psychologist, Counselor, Writer, Social Worker.";
    if (type == "INTJ") return "Scientist, Engineer, Strategist, Software Developer.";
    if (type == "ISTP") return "Mechanic, Pilot, Technician, Systems Analyst.";
    if (type == "ISFP") return "Artist, Designer, Chef, Musician.";
    if (type == "INFP") return "Therapist, Author, Graphic Designer, Teacher.";
    if (type == "INTP") return "Philosopher, Scientist, Researcher, Software Engineer.";
    if (type == "ESTP") return "Entrepreneur, Salesperson, Police Officer, Athlete.";
    if (type == "ESFP") return "Actor, Event Planner, Tour Guide, Entertainer.";
    if (type == "ENFP") return "Journalist, PR Specialist, Consultant, Actor.";
    if (type == "ENTP") return "Lawyer, Entrepreneur, Consultant, Inventor.";
    if (type == "ESTJ") return "Manager, Military Officer, Judge, Administrator.";
    if (type == "ESFJ") return "Nurse, Teacher, Event Coordinator, Counselor.";
    if (type == "ENFJ") return "Politician, Teacher, Coach, HR Manager.";
    if (type == "ENTJ") return "CEO, Strategist, Entrepreneur, Executive.";
    return "No career suggestions available.";
}

int main() {
    
    // Step 1: Simply print of welcome greeting
    cout << "Welcome to the KKKAR Personality Type Test!\n\n";

    // Step 2: Declare variables for IE, SN, TF, JP Scores and Sex
    int IE_Score = 0, SN_Score = 0, TF_Score = 0, JP_Score = 0;
    string sex;

    // Step 3: Enter Sex
    cout << "Please Enter Your Sex (Male/Female): ";
    cin >> sex;

    // Step 3: Enter answers for each question,
    // Note: Everytime a user is asked to answer a question, the function "Question" is being called. Please refer to step 4 above"
    //Step 7: All answers are added to each correspending variable
    IE_Score += Question("You enjoy social events with lots of people.");
    IE_Score += Question("You feel energized when you interact with others.");
    IE_Score += Question("You find spending time alone less satisfying than group activities.");

    SN_Score += Question("You prefer learning facts over abstract theories.");
    SN_Score += Question("You focus more on the present moment than on future possibilities.");
    SN_Score += Question("You rely on experience rather than imagination when solving problems.");

    TF_Score += Question("You make decisions based on logic rather than emotions.");
    TF_Score += Question("You value honesty over making others feel good.");
    TF_Score += Question("You prioritize critical thinking over empathy.");

    JP_Score += Question("You like to plan things in advance rather than being spontaneous.");
    JP_Score += Question("You prefer having a set schedule over flexibility.");
    JP_Score += Question("You feel satisfied when tasks are completed rather than left open-ended.");
    
    // Step 8: If all questions are answered, the function "calculate" will be executed for each type
    // Note: The calculation will have 3 parameters, the score, the option 1, and the last, the option 2. Please refer to step 9
    char I_E = calculate(IE_Score, 'E', 'I');
    char S_N = calculate(SN_Score, 'S', 'N');
    char T_F = calculate(TF_Score, 'T', 'F');
    char J_P = calculate(JP_Score, 'J', 'P');

    //Step 10: Append or pagdikitin yung mga resut per scores dun sa step 8 and 9, HAHAHAH tinagalog. ndi ko alam english ng pagdikitin eh
    string personalityType = "";
    personalityType += I_E;
    personalityType += S_N;
    personalityType += T_F;
    personalityType += J_P;

    //Step 11: Print the personality type
    cout << "\nYour personality type is: " << personalityType << "\n";    //Step 11: Print the personality type
    
    //Step 11: Print the description, based on the matching personality type
    cout << "\nDescription of your type: \n";
    if (personalityType == "ISTJ") cout << "The Inspector: Responsible, sincere, analytical, and logical.";
    else if (personalityType == "ISFJ") cout << "The Protector: Warm, caring, and dependable.";
    else if (personalityType == "INFJ") cout << "The Advocate: Idealistic, empathetic, and visionary.";
    else if (personalityType == "INTJ") cout << "The Architect: Strategic, logical, and independent.";
    else if (personalityType == "ISTP") cout << "The Virtuoso: Practical, resourceful, and adaptable.";
    else if (personalityType == "ISFP") cout << "The Adventurer: Sensitive, artistic, and curious.";
    else if (personalityType == "INFP") cout << "The Mediator: Idealistic, empathetic, and imaginative.";
    else if (personalityType == "INTP") cout << "The Thinker: Analytical, curious, and inventive.";
    else if (personalityType == "ESTP") cout << "The Entrepreneur: Energetic, spontaneous, and adaptable.";
    else if (personalityType == "ESFP") cout << "The Entertainer: Fun-loving, enthusiastic, and outgoing.";
    else if (personalityType == "ENFP") cout << "The Campaigner: Imaginative, optimistic, and passionate.";
    else if (personalityType == "ENTP") cout << "The Debater: Curious, clever, and outspoken.";
    else if (personalityType == "ESTJ") cout << "The Executive: Organized, practical, and assertive.";
    else if (personalityType == "ESFJ") cout << "The Consul: Warm, caring, and sociable.";
    else if (personalityType == "ENFJ") cout << "The Protagonist: Inspiring, charismatic, and empathetic.";
    else if (personalityType == "ENTJ") cout << "The Commander: Strategic, ambitious, and outgoing.";
    else cout << "Unknown type.";

    // Step 12: Print the personality by running the function "Compatibility"
    cout << "\n\nPersonality Compatibility: " << Compatibility(personalityType);
    
    // Step 14: Print the personality by running the function "Career"
    cout << "\nSuggested Careers: " << Career(personalityType);

    cout << "\n\nThank you for taking the test!\n";
    return 0;
}
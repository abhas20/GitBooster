import ai from "../../gemini"


export const aiAnalysis = async (data: any, newQuestion:string[]) => {
   try {


     const systemInstruction = `You are an AI assistant that helps developers understand code changes in a pull request. 
      Analyze the provided pull request diff and answer the user's question based on the informaton you have.
      Provide clear and concise explanations, focusing on the modifications introduced by the pull request.
      Your responses MUST be formatted in clean, valid HTML with proper structure. 
      Use tags like <p>, <strong>, <em>, <ul>, <ol>, <li>, <h1> to <h6>, and <br> when appropriate. 
      Do NOT wrap the entire response in a single <p> tag unless it's a single paragraph. 
      Avoid inline styles, JavaScript, or custom attributes.
      
      Rendered like this in JSX:
      <p dangerouslySetInnerHTML={{ __html: YOUR_RESPONSE }} />,
    `;

     const response = await ai.models.generateContent({
       model: "gemini-2.5-flash", 
       contents: [
         {
           role: "user",
           parts: [
             {
               text: `Here is the pull request diff and PR detail:\n\n${JSON.stringify(
                 data
               )}\n\nUser's question: ${newQuestion}`,
             },
           ],
         },
       ],
       config: {
         temperature: 0.2,
         systemInstruction: {
             role: "system",
             parts: [{ text: systemInstruction }],
            },
        },
     });


     return response.text || "I don't know";
   } catch (error) {
     console.log("AI Analysis Error:", error);
     throw new Error("AI Analysis Failed");
   }
}; 

export const askAiDoubt = async (data: any, newQuestion: string) => {
  try {
    const systemInstruction = `You are an AI assistant that helps developers understand code changes in a pull request. 
      Analyze the provided pull request diff and answer the user's question based on the informaton you have.
      Provide clear and concise explanations say about not more than 100 words, focusing on the modifications introduced by the pull request.
      Your responses MUST be formatted in clean, valid HTML with proper structure. 
      Use tags like <p>, <strong>, <em>, <ul>, <ol>, <li>, <h1> to <h6>, and <br> when appropriate. 
      Do NOT wrap the entire response in a single <p> tag unless it's a single paragraph. 
      Avoid inline styles, JavaScript, or custom attributes.
      
      Rendered like this in JSX:
      <p dangerouslySetInnerHTML={{ __html: YOUR_RESPONSE }} />,
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Here is PR detail and diff:\n\n${JSON.stringify(
                data
              )}\n\nUser's question: ${newQuestion}`,
            },
          ],
        },
      ],
      config: {
        temperature: 0.2,
        systemInstruction: {
          role: "system",
          parts: [{ text: systemInstruction }],
        },
      },
    });

    return response.text || "I don't know";
  } catch (error) {
    console.log("AI Analysis Error:", error);
    throw new Error("AI Analysis Failed");
  }
}; 
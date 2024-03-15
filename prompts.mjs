import prompts from "prompts";

export default class Prompt {
  constructor() {
    this.response = null;
  }
  async selectFiles(filesPngConverted) {
    this.response = await prompts(
      {
        type: "multiselect",
        name: "value",
        message: "Select the files to convert",
        choices: filesPngConverted.map((file) => ({
          title: file,
          value: file,
        })),
      },
      { onCancel: () => process.exit(1) }
    );
    return this.response;
  }
  async enterFileName() {
    this.response = await prompts(
      {
        type: "text",
        name: "value",
        message: "Enter the name of the file",
      },
      { onCancel: () => process.exit(1) }
    );
    return this.response;
  }
}

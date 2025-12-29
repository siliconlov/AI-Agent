import os
from llm_engine import LLMEngine
from rich.console import Console

console = Console()

class Reporter:
    def __init__(self, llm: LLMEngine):
        self.llm = llm

    def generate_report(self, topic: str, research_data: list[dict]) -> str:
        """
        Compiles the research data into a final report.
        """
        console.print(f"[bold green]Generating Report for:[/bold green] {topic}")
        
        context = ""
        for item in research_data:
            context += f"\n## Q: {item['question']}\n{item['content']}\n"

        system_prompt = (
            "You are an expert technical writer. "
            "Write a structured markdown report based *strictly* on the provided research notes. "
            "Do not hallucinate new info. "
            "Include a header, an executive summary, main body sections, and a conclusion. "
            "Preserve citation markers [1], [2] etc from the text."
        )

        user_prompt = f"Topic: {topic}\n\nResearch Notes:\n{context}"

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        report_content = self.llm.chat(messages)
        
        return report_content

    def save_report(self, topic: str, content: str):
        filename = f"{topic.replace(' ', '_')}_Report.md"
        with open(filename, "w", encoding="utf-8") as f:
            f.write(content)
        console.print(f"[bold blue]Report saved to:[/bold blue] {os.path.abspath(filename)}")


import json
from llm_engine import LLMEngine
from rich.console import Console

console = Console()

class Planner:
    def __init__(self, llm: LLMEngine):
        self.llm = llm

    def make_plan(self, topic: str) -> list[str]:
        """
        Generates a list of research questions based on the topic.
        """
        console.print(f"[bold cyan]Planning research for:[/bold cyan] {topic}")
        
        system_prompt = (
            "You are a research planner. "
            "Given a topic, generate a list of 3-5 distinct, "
            "researchable questions to fully understand the topic. "
            "Return ONLY a JSON list of strings, like this: "
            "[\"question 1\", \"question 2\"]"
        )
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Topic: {topic}"}
        ]

        # Use JSON mode if possible, but standard parsing is safer for raw models
        response_text = self.llm.chat(messages, json_mode=True)
        console.print(f"[dim]Planner Raw Output: {response_text[:200]}...[/dim]")
        
        # Clean up potential markdown code blocks
        clean_text = response_text.replace("```json", "").replace("```", "").strip()
        
        try:
            questions = json.loads(clean_text)
            if isinstance(questions, list):
                return questions[:5]
            if isinstance(questions, dict) and 'questions' in questions:
                return questions['questions']
            return [topic] # Fallback
        except Exception as e:
            console.print(f"[red]Error parsing plan: {e}[/red]")
            return [f"What is the history of {topic}?", f"What are the key features of {topic}?", f"What is the future of {topic}?"]


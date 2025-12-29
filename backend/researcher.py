from llm_engine import LLMEngine
from search_engine import SearchEngine
from rich.console import Console

console = Console()

class Researcher:
    def __init__(self, llm: LLMEngine):
        self.llm = llm
        self.search_engine = SearchEngine()

    def research_question(self, question: str) -> dict:
        """
        Research a specific question:
        1. Search web
        2. Feed results to LLM
        3. Return summary and sources
        """
        console.print(f"[bold yellow]Researching:[/bold yellow] {question}")
        
        # 1. Search
        search_results = self.search_engine.search(question, max_results=5)
        
        if not search_results:
            return {
                "question": question,
                "content": "No relevant search results found.",
                "citations": []
            }

        # 2. Contextualize
        context_str = ""
        citations = []
        for i, res in enumerate(search_results):
            context_str += f"Source [{i+1}]: {res['title']}\n{res['body']}\nURL: {res['href']}\n\n"
            citations.append(res['href'])

        # 3. Analyze with LLM
        system_prompt = (
            "You are a helpful researcher. "
            "Read the provided search results and answer the user's question. "
            "Cite sources using [1], [2] notation based on the provided Source numbers. "
            "Be concise and factual."
        )
        
        user_prompt = f"Question: {question}\n\nSearch Results:\n{context_str}"
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        answer = self.llm.chat(messages)
        
        return {
            "question": question,
            "content": answer,
            "citations": citations
        }

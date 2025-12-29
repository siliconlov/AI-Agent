from ollama import Client

class LLMEngine:
    def __init__(self, model="llama3.2:3b"):
        self.model = model
        self.client = Client()

    def chat(self, messages: list, json_mode=False) -> str:
        """
        Send a chat request to Ollama.
        """
        options = {}
        format = None
        if json_mode:
            format = "json"
            options["temperature"] = 0.2 # Lower temp for structures

        try:
            response = self.client.chat(
                model=self.model,
                messages=messages,
                format=format,
                options=options
            )
            return response['message']['content']
        except Exception as e:
            print(f"Error calling Ollama ({self.model}): {e}")
            raise e

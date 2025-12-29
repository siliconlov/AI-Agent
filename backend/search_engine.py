from duckduckgo_search import DDGS

class SearchEngine:
    def __init__(self):
        self.ddgs = DDGS()

    def search(self, query: str, max_results=5) -> list:
        """
        Perform a web search using DuckDuckGo.
        Returns a list of dicts: [{'title':, 'href':, 'body':}]
        """
        print(f"Searching: {query}")
        results = []
        try:
            # DDGS text search generator
            search_gen = self.ddgs.text(query, max_results=max_results)
            for r in search_gen:
                results.append({
                    "title": r.get('title'),
                    "href": r.get('href'),
                    "body": r.get('body')
                })
        except Exception as e:
            print(f"Search failed: {e}")
        
        return results

import sys
import os
from dotenv import load_dotenv
from rich.console import Console
from perplexity_client import PerplexityClient
from planner import Planner
from researcher import Researcher
from reporter import Reporter

# Load env variables (API key)
load_dotenv()

console = Console()

import logging
logging.basicConfig(filename='debug.log', level=logging.INFO, format='%(asctime)s %(message)s', force=True)

def main():
    if not os.getenv("PERPLEXITY_API_KEY"):
        console.print("[bold red]Error:[/bold red] PERPLEXITY_API_KEY not found in .env file.")
        logging.error("No API KEY")
        return

    if len(sys.argv) < 2:
        console.print("Usage: python main.py \"Topic to research\"")
        topic = console.input("[bold yellow]Enter topic manually: [/bold yellow]")
    else:
        topic = sys.argv[1]

    if not topic:
        return

    logging.info(f"Starting run for topic: {topic}")
    client = PerplexityClient()
    
    # 1. Plan
    planner = Planner(client)
    try:
        questions = planner.make_plan(topic)
        logging.info(f"Plan: {questions}")
    except Exception as e:
        logging.error(f"Planning failed: {e}")
        return
    console.print(f"[dim]Plan: {questions}[/dim]")

    # 2. Research
    researcher = Researcher(client)
    results = []
    for i, q in enumerate(questions):
        logging.info(f"Researching Q{i}: {q}")
        try:
             data = researcher.research_question(q)
             logging.info(f"Research done for Q{i}")
             results.append(data)
        except Exception as e:
             logging.error(f"Research failed for Q{i}: {e}")

    # 3. Report
    logging.info("Generating report...")
    reporter = Reporter(client)
    report = reporter.generate_report(topic, results)
    reporter.save_report(topic, report)
    logging.info("Run complete.")

if __name__ == "__main__":
    main()

from fastapi import FastAPI

app = FastAPI(title="Ezriya AI Vision Service")

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ai-vision"}

@app.post("/analyze/condition")
def analyze_condition(image_url: str):
    # TODO: Implement actual vision model logic
    return {
        "condition_score": 0.85, 
        "tags": ["modern", "well-lit", "clean"],
        "estimated_renovation_cost": 0
    }

import os

from flask import Flask, jsonify, request
from flask_cors import CORS

from models import db, User, Complaint


app = Flask(__name__)

CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
    "DATABASE_URL",
    "postgresql://complaint_user:complaint_password@localhost:5432/complaint_db"
)

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy"
    })

@app.route("/ready", methods=["GET"])
def ready():
    try:
        db.session.execute(db.text("SELECT 1"))
        return jsonify({"status": "ready"}), 200
    except Exception:
        db.session.rollback()
        return jsonify({"status": "not ready"}), 503


@app.route("/api/complaints", methods=["GET"])
def get_complaints():
    complaints = Complaint.query.order_by(
        Complaint.created_at.desc()
    ).all()

    return jsonify([
        {
            "id": complaint.id,
            "user_id": complaint.user_id,
            "title": complaint.title,
            "category": complaint.category,
            "description": complaint.description,
            "location": complaint.location,
            "status": complaint.status,
            "priority": complaint.priority,
            "created_at": (
                complaint.created_at.isoformat()
                if complaint.created_at
                else None
            )
        }
        for complaint in complaints
    ])


@app.route("/api/complaints", methods=["POST"])
def create_complaint():
    data = request.get_json()

    required_fields = [
        "user_id",
        "title",
        "category",
        "description",
        "location"
    ]

    for field in required_fields:
        if not data.get(field):
            return jsonify({
                "error": f"{field} is required"
            }), 400

    user = db.session.get(User, data["user_id"])

    if not user:
        return jsonify({
            "error": "User not found"
        }), 404

    complaint = Complaint(
        user_id=data["user_id"],
        title=data["title"],
        category=data["category"],
        description=data["description"],
        location=data["location"],
        priority=data.get("priority", "Medium")
    )

    db.session.add(complaint)
    db.session.commit()

    return jsonify({
        "message": "Complaint created successfully",
        "complaint_id": complaint.id
    }), 201


@app.route("/api/complaints/<int:complaint_id>", methods=["PUT"])
def update_complaint(complaint_id):
    complaint = db.session.get(Complaint, complaint_id)

    if not complaint:
        return jsonify({
            "error": "Complaint not found"
        }), 404

    data = request.get_json()

    if "status" in data:
        complaint.status = data["status"]

    if "priority" in data:
        complaint.priority = data["priority"]

    db.session.commit()

    return jsonify({
        "message": "Complaint updated successfully"
    })


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )
// Anomaly Detection Engine for autonomous devices in BDTF system

function getMissionProfileForDeviceType(deviceType) {
  const profiles = {
    "Drone": {
      speedRange: { min: 20, max: 80 },
      altitudeRange: { min: 50, max: 300 },
      minBattery: 15,
      maxHeadingDeviation: 45
    },
    "Ground Vehicle": {
      speedRange: { min: 0, max: 40 },
      altitudeRange: { min: 0, max: 10 },
      minBattery: 20,
      maxHeadingDeviation: 30
    },
    "Surveillance Node": {
      speedRange: { min: 0, max: 5 },
      altitudeRange: { min: 0, max: 50 },
      minBattery: 25,
      maxHeadingDeviation: 20
    },
    "Command Node": {
      speedRange: { min: 0, max: 2 },
      altitudeRange: { min: 0, max: 5 },
      minBattery: 30,
      maxHeadingDeviation: 10
    }
  };
  return profiles[deviceType] || profiles["Drone"];
}

export function analyzeDevice(observedData, deviceType) {
  const missionProfile = getMissionProfileForDeviceType(deviceType);
  const anomalies = [];

  const {
    sector,
    speed,
    altitude,
    signal,
    lastCommand,
    responding,
    battery,
    headingDeviation
  } = observedData;

  const { assignedSector } = observedData;

  // Rule 1: SECTOR_BREACH
  if (sector && assignedSector && sector !== assignedSector) {
    anomalies.push({
      type: "SECTOR_BREACH",
      severity: "Critical",
      confidence: 95,
      description: `Device detected in ${sector} but assigned to ${assignedSector}`
    });
  }

  // Rule 2: SPEED_ANOMALY
  if (speed > missionProfile.speedRange.max * 1.3) {
    anomalies.push({
      type: "SPEED_ANOMALY",
      severity: "High",
      confidence: 88,
      description: `Speed ${speed} km/h exceeds safe threshold ${missionProfile.speedRange.max * 1.3}`
    });
  }

  // Rule 3: ALTITUDE_ANOMALY
  if (altitude > missionProfile.altitudeRange.max * 1.2 || altitude < missionProfile.altitudeRange.min * 0.8) {
    anomalies.push({
      type: "ALTITUDE_ANOMALY",
      severity: "Medium",
      confidence: 80,
      description: `Altitude ${altitude}m outside expected range [${missionProfile.altitudeRange.min * 0.8}-${missionProfile.altitudeRange.max * 1.2}]`
    });
  }

  // Rule 4: SIGNAL_LOST
  if (signal === "Lost") {
    anomalies.push({
      type: "SIGNAL_LOST",
      severity: "Critical",
      confidence: 99,
      description: "Signal completely lost - device not responding"
    });
  }

  // Rule 5: SIGNAL_WEAK
  if (signal === "Weak") {
    anomalies.push({
      type: "SIGNAL_WEAK",
      severity: "High",
      confidence: 85,
      description: "Signal weak - communication degraded"
    });
  }

  // Rule 6: COMMAND_UNRESPONSIVE
  if (responding === false) {
    anomalies.push({
      type: "COMMAND_UNRESPONSIVE",
      severity: "High",
      confidence: 93,
      description: "Device not responding to commands"
    });
  }

  // Rule 7: BATTERY_CRITICAL
  if (battery < missionProfile.minBattery) {
    anomalies.push({
      type: "BATTERY_CRITICAL",
      severity: "Medium",
      confidence: 99,
      description: `Battery ${battery}% below minimum threshold ${missionProfile.minBattery}%`
    });
  }

  // Rule 8: HEADING_DEVIATION high
  if (headingDeviation > 90) {
    anomalies.push({
      type: "HEADING_DEVIATION_CRITICAL",
      severity: "Critical",
      confidence: 87,
      description: `Heading deviation ${headingDeviation}° indicates severe course deviation`
    });
  } else if (headingDeviation > 45) {
    anomalies.push({
      type: "HEADING_DEVIATION_HIGH",
      severity: "High",
      confidence: 78,
      description: `Heading deviation ${headingDeviation}° exceeds normal range`
    });
  }

  // Rule 10: BEHAVIORAL_COMPROMISE
  if (anomalies.length >= 3) {
    // Replace individual anomalies with comprehensive behavioral issue
    const count = anomalies.length;
    anomalies.length = 0;
    anomalies.push({
      type: "BEHAVIORAL_COMPROMISE",
      severity: "Critical",
      confidence: 94,
      description: `${count} simultaneous violations detected. Pattern consistent with enemy device takeover.`
    });
  }

  // Determine overall severity
  const severityMap = { "Critical": 3, "High": 2, "Medium": 1 };
  let overallSeverity = "Normal";
  let maxSeverityLevel = 0;

  for (const anomaly of anomalies) {
    const level = severityMap[anomaly.severity] || 0;
    if (level > maxSeverityLevel) {
      maxSeverityLevel = level;
      overallSeverity = anomaly.severity;
    }
  }

  // Calculate average confidence
  const confidenceScore = anomalies.length > 0
    ? Math.round(anomalies.reduce((sum, a) => sum + a.confidence, 0) / anomalies.length)
    : 100;

  // Generate summary
  const summary = anomalies.length === 0
    ? "Device operating normally"
    : `${anomalies.length} anomalies detected`;

  return {
    anomalies,
    overallSeverity,
    confidenceScore,
    summary,
    missionProfile
  };
}
export async function analyzeWithAI(signalArray) {
  const response = await fetch("http://localhost:3000/analyze-ai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ data: signalArray })
  });

  const result = await response.json();
  return result.prediction;
}

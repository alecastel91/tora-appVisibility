import React from 'react';

/**
 * WorkflowTimeline Component
 * Displays the booking workflow progress with 4 main steps
 * Props:
 *  - deal: Deal object with workflow status
 */
const WorkflowTimeline = ({ deal }) => {
  if (!deal) return null;

  // Calculate workflow steps status
  const steps = [
    {
      key: 'offerAccepted',
      label: 'Offer Accepted',
      icon: '✓',
      completed: deal.status === 'ACCEPTED' || deal.status === 'COMPLETED',
      timestamp: deal.updatedAt
    },
    {
      key: 'contractSigned',
      label: 'Contract Signed',
      icon: '📝',
      completed: deal.contract?.status === 'FULLY_SIGNED',
      timestamp: deal.contract?.fullySignedAt
    },
    {
      key: 'documentsShared',
      label: 'Documents Shared',
      icon: '📎',
      completed: deal.sharedDocuments?.pressKit?.shared && deal.sharedDocuments?.technicalRider?.shared,
      timestamp: null // Could calculate max of both document timestamps
    },
    {
      key: 'paymentReceived',
      label: 'Payment Received',
      icon: '💰',
      completed: deal.payment?.status === 'FULLY_PAID',
      timestamp: deal.payment?.fullPaymentAt
    }
  ];

  // Calculate overall progress
  const completedSteps = steps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  return (
    <div className="workflow-timeline">
      {/* Progress Bar */}
      <div className="workflow-progress-bar">
        <div
          className="workflow-progress-fill"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Timeline Steps */}
      <div className="workflow-steps">
        {steps.map((step, index) => (
          <div
            key={step.key}
            className={`workflow-step ${step.completed ? 'completed' : 'pending'}`}
          >
            {/* Step Icon */}
            <div className="workflow-step-icon">
              {step.completed ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : (
                <div className="workflow-step-number">{index + 1}</div>
              )}
            </div>

            {/* Step Label */}
            <div className="workflow-step-label">
              {step.label}
            </div>

            {/* Step Timestamp */}
            {step.completed && step.timestamp && (
              <div className="workflow-step-timestamp">
                {new Date(step.timestamp).toLocaleDateString()}
              </div>
            )}

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className={`workflow-connector ${step.completed && steps[index + 1].completed ? 'completed' : 'pending'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Progress Text */}
      <div className="workflow-progress-text">
        {completedSteps === steps.length ? (
          <span className="workflow-complete">All steps completed!</span>
        ) : (
          <span>{completedSteps} of {steps.length} steps completed</span>
        )}
      </div>
    </div>
  );
};

export default WorkflowTimeline;

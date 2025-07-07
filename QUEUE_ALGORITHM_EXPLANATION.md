# Queue Traffic Prediction Algorithm

## Overview
The barbershop queue management system uses a combination of real-time calculations and static traffic patterns to provide customers with accurate wait times and recommendations.

## Core Wait Time Calculation

### Basic Formula
```
Estimated Wait Time = Current Queue Length × 15 minutes per person
```

### Example Calculations:
- **0 people waiting**: "No wait"
- **1 person waiting**: "15-20 minutes"
- **2 people waiting**: "30-35 minutes"
- **3 people waiting**: "45-50 minutes"

### Why 15 minutes?
This is based on typical barbershop service times:
- Simple trim: 10-15 minutes
- Full cut & style: 15-25 minutes
- Beard grooming: 5-10 minutes
- Buffer time for conversations: 2-5 minutes

The system adds a 5-minute buffer to account for variations in service complexity.

## Traffic Prediction System

### Current Implementation
The system shows three traffic periods with static predictions:

1. **Now (Current Time)**: Low Traffic
   - Typically shows as "Low" regardless of actual queue
   - Encourages immediate visits

2. **Afternoon (2-5 PM)**: Moderate Traffic
   - Based on typical after-work patterns
   - Usually busier than morning hours

3. **Evening (6-8 PM)**: High Traffic
   - Peak hours when most people are off work
   - Highest expected wait times

### How It Works Behind the Scenes

#### 1. Real-Time Queue Tracking
- **Database Storage**: All queue entries are stored in PostgreSQL
- **WebSocket Updates**: Real-time broadcasting of queue changes
- **Automatic Refresh**: Client updates every 30 seconds as backup

#### 2. Traffic Pattern Analysis
The system is designed to collect historical data through:
- Queue length at different times of day
- Average service duration per customer
- Day of week patterns
- Seasonal variations

#### 3. Smart Recommendations
The "Best Time to Visit" section uses:
- **Current queue length** (real-time)
- **Historical patterns** (stored in queueAnalytics table)
- **Time of day multipliers** (morning = 0.7x, afternoon = 1.0x, evening = 1.3x)

## Advanced Features (Database Schema)

### Analytics Collection
```sql
-- Queue analytics table structure
queueAnalytics:
- date: When the data was recorded
- hour: Hour of day (0-23)
- dayOfWeek: Day of week (0-6, Sunday=0)
- queueLength: How many people were waiting
- averageWaitTime: Actual measured wait time
```

### Future Enhancements
The system is built to support:
1. **Machine Learning Predictions**: Using historical data to predict busy periods
2. **Dynamic Pricing**: Adjusting prices based on demand
3. **Appointment Scheduling**: Converting walk-ins to scheduled visits
4. **Seasonal Adjustments**: Holiday and event-based predictions

## Customer Experience

### What Customers See:
1. **Current Queue**: Real number of people waiting
2. **Estimated Wait**: Calculated wait time with buffer
3. **Traffic Prediction**: Best times to visit today
4. **Last Update**: When the information was last refreshed

### What Drives the Recommendations:
- **Low Traffic**: 0-1 people waiting, immediate service likely
- **Moderate Traffic**: 2-3 people waiting, 15-45 minute wait
- **High Traffic**: 4+ people waiting, 1+ hour wait

## Admin Control

### Real-Time Management:
- **Add Customer**: Increases queue count, updates all connected clients
- **Complete Service**: Decreases queue count, records actual duration
- **Manual Override**: Admin can adjust estimates based on special circumstances

### Data Collection:
- Every completed service records actual duration
- System learns from real service times
- Patterns are stored for future predictions

## Technical Implementation

### WebSocket Broadcasting:
```javascript
// When queue changes, all clients get instant update
broadcastQueueUpdate(queueLength) {
  message = {
    type: 'queue_update',
    count: queueLength,
    estimatedWait: calculateWaitTime(queueLength)
  }
  // Send to all connected clients
}
```

### Error Handling:
- **Connection Loss**: Clients fall back to 30-second API polling
- **Database Errors**: System shows last known good data
- **Admin Offline**: Queue still updates, but predictions may be less accurate

## Business Benefits

### For Customers:
- **Transparency**: Know exactly how long to wait
- **Convenience**: Visit during off-peak hours
- **Planning**: Schedule visits around work/personal time

### For Barbers:
- **Efficiency**: Smooth out peak/off-peak periods
- **Revenue**: Encourage visits during slower times
- **Customer Satisfaction**: Reduce frustration from unexpected waits

### For Business:
- **Data Insights**: Understand customer patterns
- **Staffing**: Schedule barbers based on predicted demand
- **Marketing**: Promote off-peak discounts automatically

## Summary

The queue algorithm is simple but effective:
1. **Count current customers** (real-time)
2. **Multiply by service time** (15 minutes + buffer)
3. **Add historical context** (time of day patterns)
4. **Broadcast updates** (WebSocket for instant delivery)
5. **Collect feedback** (actual service times improve accuracy)

This creates a transparent, efficient system that benefits both customers and the business by reducing wait times and improving the overall barbershop experience.
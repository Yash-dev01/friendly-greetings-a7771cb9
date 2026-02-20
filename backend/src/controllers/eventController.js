import Event from '../models/Event.js';

export const getAllEvents = async (req, res) => {
  try {
    const { upcoming } = req.query;
    let query = { isActive: true };

    if (upcoming === 'true') {
      query.eventDate = { $gte: new Date() };
    }

    const events = await Event.find(query)
      .populate('createdBy', 'fullName email')
      .sort({ eventDate: 1 });

    res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'fullName email')
      .populate('attendees', 'fullName email avatarUrl');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createEvent = async (req, res) => {
  try {
    const event = await Event.create({
      ...req.body,
      createdBy: req.user._id,
    });

    const populatedEvent = await Event.findById(event._id)
      .populate('createdBy', 'fullName email');

    res.status(201).json({
      success: true,
      data: populatedEvent,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('createdBy', 'fullName email');

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await event.deleteOne();

    res.json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const attendEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const alreadyAttending = event.attendees.includes(req.user._id);

    if (alreadyAttending) {
      event.attendees = event.attendees.filter((id) => id.toString() !== req.user._id.toString());
    } else {
      event.attendees.push(req.user._id);
    }

    await event.save();

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

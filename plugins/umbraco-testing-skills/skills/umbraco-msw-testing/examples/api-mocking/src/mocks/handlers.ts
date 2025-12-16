/**
 * MSW Handlers for Items API
 *
 * Demonstrates:
 * - MSW v1 syntax with rest API
 * - CRUD handlers
 * - Error simulation
 * - Delay simulation
 */

// MSW v1 is loaded as IIFE and exposed globally
const { rest } = window.MockServiceWorker;

import { itemsDb, type Item } from './items.db.js';

// Helper to create API paths (simplified version of umbracoPath)
const apiPath = (path: string) => `/umbraco/management/api/v1${path}`;

export const itemsHandlers = [
	// GET all items
	rest.get(apiPath('/items'), (req, res, ctx) => {
		const items = itemsDb.getAll();

		return res(
			ctx.status(200),
			ctx.json({
				total: items.length,
				items: items,
			})
		);
	}),

	// GET single item by ID
	rest.get(apiPath('/items/:id'), (req, res, ctx) => {
		const id = req.params.id as string;

		// Simulate forbidden access for testing
		if (id === 'forbidden') {
			return res(ctx.status(403));
		}

		// Simulate server error for testing
		if (id === 'error') {
			return res(
				ctx.status(500),
				ctx.json({
					type: 'error',
					status: 500,
					detail: 'Internal server error',
				})
			);
		}

		const item = itemsDb.getById(id);

		if (!item) {
			return res(ctx.status(404));
		}

		return res(ctx.status(200), ctx.json(item));
	}),

	// POST create new item
	rest.post(apiPath('/items'), async (req, res, ctx) => {
		const body = await req.json();

		// Validate required fields
		if (!body.name) {
			return res(
				ctx.status(400),
				ctx.json({
					type: 'validation',
					status: 400,
					detail: 'Validation failed',
					errors: {
						name: ['Name is required'],
					},
				})
			);
		}

		// Check for duplicate name
		if (itemsDb.getByName(body.name)) {
			return res(
				ctx.status(400),
				ctx.json({
					type: 'validation',
					status: 400,
					detail: 'Item already exists',
					errors: {
						name: ['An item with this name already exists'],
					},
				})
			);
		}

		const newItem = itemsDb.create({
			name: body.name,
			description: body.description || '',
		});

		return res(
			ctx.status(201),
			ctx.set({
				Location: `${apiPath('/items')}/${newItem.id}`,
				'Umb-Generated-Resource': newItem.id,
			}),
			ctx.json(newItem)
		);
	}),

	// PUT update item
	rest.put(apiPath('/items/:id'), async (req, res, ctx) => {
		const id = req.params.id as string;
		const body = await req.json();

		if (!itemsDb.exists(id)) {
			return res(ctx.status(404));
		}

		const updated = itemsDb.update(id, body);

		return res(ctx.status(200), ctx.json(updated));
	}),

	// DELETE item
	rest.delete(apiPath('/items/:id'), (req, res, ctx) => {
		const id = req.params.id as string;

		if (!itemsDb.exists(id)) {
			return res(ctx.status(404));
		}

		itemsDb.delete(id);

		return res(ctx.status(200));
	}),
];

// Slow endpoint for testing loading states
export const slowHandlers = [
	rest.get(apiPath('/slow'), (req, res, ctx) => {
		return res(ctx.delay(2000), ctx.status(200), ctx.json({ message: 'Finally loaded!' }));
	}),
];

// Export all handlers
export const handlers = [...itemsHandlers, ...slowHandlers];

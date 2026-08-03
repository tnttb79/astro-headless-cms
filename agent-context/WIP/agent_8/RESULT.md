# What Was Done

- Limited the homepage Featured services query to the first three CMS-featured services.
- Limited the non-featured fallback path to three services as well.
- Kept the dedicated Services page unchanged, where Herbal Medicine and the complete service catalog remain available.

# Result

The homepage now renders one balanced desktop row of three featured service cards instead of wrapping a fourth card onto a row by itself. The implementation remains CMS-driven and continues to respect featured status and display order.

Validation completed successfully:

- `npm run build` completed with exit code 0.
- A local rendered-homepage check returned exactly three `Explore this service` card links.
- The complete Services page still receives the full treatments collection.

# Items Left to Take Care Of

None.

# Atelier: Data and Licensing Research for #17

Checked 2026-10-19. Scope: proposed Vue/webpack art-discovery showcase;
documentation research only, not legal advice or assurance. No repository
changes, installs, tests, git writes, image downloads, or network writes were
performed.

## Official Documentation and Policy

- **Access:** No authentication required; anonymous API traffic is limited to
  **60 requests/minute per IP**. HTTPS is requested. `AIC-User-Agent`
  identifying the project/contact is a courtesy, not a credential.
  [API authentication](https://api.artic.edu/docs/#authentication)
- **CORS and hotlinking:** Documentation states API responses and images send
  `Access-Control-Allow-Origin: *`; hotlinking is welcomed. This documents
  browser suitability, not measured availability.
  [Image sizes](https://api.artic.edu/docs/#image-sizes)
- **Filtering and IIIF:** Search with `query[term][is_public_domain]=true`. IIIF
  also exposes non-public-domain images: accessibility is not permission.
  Construct URLs from response `config.iiif_url` plus
  `/{image_id}/full/843,/0/default.jpg`; 843px is recommended, with
  200/400/600px alternatives.
  [Copyright](https://api.artic.edu/docs/#copyright),
  [IIIF](https://api.artic.edu/docs/#iiif-image-api),
  [sizes](https://api.artic.edu/docs/#image-sizes)
- **Metadata versus descriptions:** Artwork-response data is **CC0 1.0 except
  `description`, which is CC BY 4.0**; museum terms also apply. This is not a
  blanket license for every linked image or website article.
  [Artworks endpoint](https://api.artic.edu/docs/#artworks)
- **Museum corroboration:** CC0-designated images may be used commercially or
  noncommercially without fees or additional museum permission. The museum
  nevertheless disclaims warranties and makes users responsible for necessary
  third-party permissions. Non-CC0 image requests go through Art Resource; do
  not silently substitute them.
  [Open Access Images](https://www.artic.edu/open-access/open-access-images),
  [Image Licensing](https://www.artic.edu/image-licensing),
  [Terms: Copyrights and Fair Use](https://www.artic.edu/terms)
- **Image attribution:** The museum requests the caption: "Artist. Title, Date.
  The Art Institute of Chicago." This is a museum request, not the CC BY
  requirement applicable to descriptions. Its open-access page also confirms
  public-domain IIIF manifests and says to assume a work is not public domain if
  its artwork page lacks the download button.
  [Open Access Images](https://www.artic.edu/open-access/open-access-images)
- **Description attribution:** CC BY 4.0 requires retaining supplied
  creator/attribution information and notices, linking to the material where
  practicable and to the license, and identifying modifications. It does not
  permit implied sponsorship or endorsement.
  [CC BY 4.0 legal code, sections 2-3](https://creativecommons.org/licenses/by/4.0/legalcode.en)
- **Branding:** Museum terms reserve trademarks, including its name, logo,
  lions, and building image; they do not grant general branding permission. The
  link-exchange policy specifies the museum name with its registered-mark notice
  or its URL for identification. CC0 guidance separately cautions against
  implying endorsement. [Museum Terms](https://www.artic.edu/terms),
  [CC0 guidance](https://creativecommons.org/publicdomain/zero/1.0/)
- **Withdrawal:** Images can be unpublished/replaced; terms reserve withdrawal
  of any image, text, or data and disclaim continuous availability.
  [API warning](https://api.artic.edu/docs/#image-sizes),
  [Terms: Disclaimer of Warranties](https://www.artic.edu/terms). Withdrawal is
  not itself evidence that a prior CC0 dedication was revoked: CC0 describes its
  waiver as irrevocable, within its scope and applicable law. Third-party rights
  remain unresolved by that waiver.
  [CC0 legal code, sections 2-4](https://creativecommons.org/publicdomain/zero/1.0/legalcode.en)

## Proposed Safeguards (Engineering Inferences, Not Museum Rules)

1. Start with public-domain artworks only; also require a nonempty `image_id`
   and recheck the returned flag before displaying. Missing/conflicting rights
   information should produce a placeholder, not an unrestricted-image fallback.
2. Omit `description` initially. If introduced, give it separate CC BY
   attribution and source/license links; preserve supplied notices and label
   edits. Do not put all fetched content under the repository's code license.
3. Use independent Atelier branding, the requested image caption, an
   artwork-source link, and a clear non-affiliation statement. Do not use museum
   trademarks as Atelier's identity.
4. Debounce searches, deduplicate requests, cache briefly, and back off on
   throttling. A shared IP can exhaust the allowance. Hotlink images with error
   placeholders; retain artwork IDs/source links and refresh rights/image
   references rather than assuming permanence. These implementation choices are
   not prescribed cache durations or retry rules.

## Blockers and Limits

- **Research blockers: none remaining.** The web reader failed on museum policy
  pages; direct HTTPS text retrieval succeeded. Only this note was written.
- **Parent follow-up:** Browser CORS/preflight, runtime throttling, and image
  delivery were not tested, as requested. API behavior above is
  documentation-verified, not runtime-certified. Before shipping, check the
  selected records and attribution UI; obtain qualified advice for unresolved
  rights questions or uses outside this narrow scope. This note does not
  establish legal clearance.

## Read-only API probe

The parent also verified a credential-free HTTPS request on 2026-10-19. A JSON
`params` query with `query.bool.must.multi_match` over `title` and
`artist_title`, plus a `query.bool.filter` public-domain term, returned Monet
works, `is_public_domain: true`, image IDs and a museum IIIF base URL. The
sample reported 46 matches; this is evidence of that response, not a stable
count or a CI expectation. Combining the shortcut `q` with a top-level term
query instead reported the much larger public-domain population, so the adapter
must put text matching and rights filtering in the same Boolean query. See the
[official search documentation](https://api.artic.edu/docs/#search).

No images were downloaded. This validates response shape and query semantics for
one request; browser CORS, availability and throttling remain separate checks,
not implied guarantees. CI must use controlled HTTP data.

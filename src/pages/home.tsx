import { useState } from 'react';
import styled from '@emotion/styled';
import { Button, Card, CardContent, CardMedia, CircularProgress, Dialog, Modal, Typography } from '@mui/material';
import useSWRInfinite from 'swr/infinite';

type Artwork = { id: string; image_id?: string; title: string; artist_title: string; [k: string]: unknown };

export const HomePage = () => {
  return (
    <HomePageWrapper>
      <MaxWidthWrapper>
        <HomePageContent />
      </MaxWidthWrapper>
    </HomePageWrapper>
  );
};

const HomePageContent = () => {
  const [openArtwork, setOpenArtwork] = useState<Artwork>();

  const getImages = async (url: string) => {
    const response = await fetch(url).then((res) => res.json());
    return response.data as Array<Artwork>;
  };
  const { data, error, size, setSize, isValidating } = useSWRInfinite(
    (_page) => `https://api.artic.edu/api/v1/artworks?page=${_page + 1}`,
    getImages,
    { revalidateOnFocus: false }
  );

  const isInitialLoading = isValidating && size === 1;
  const isSubsequentLoading = isValidating && size > 1;

  if (error) return <div>Something went wrong 🙁</div>;

  if (isInitialLoading) return <CircularProgress />;

  return (
    <>
      <CardGrid>
        {data &&
          data.flat().map((artwork) => {
            const { id, image_id, title, artist_title } = artwork;
            return image_id ? (
              <CardWrapper
                key={id}
                tabIndex={0}
                onClick={() => setOpenArtwork(artwork)}
                onKeyDown={({ key }) => {
                  if (key === 'Enter' || key === ' ') setOpenArtwork(artwork);
                }}
              >
                <CardImageWrapper>
                  <CardMedia
                    component='img'
                    image={`https://www.artic.edu/iiif/2/${image_id}/full/843,/0/default.jpg`}
                    alt={`${artwork.title} by  ${artwork.image_id}`}
                    height={200}
                  />
                </CardImageWrapper>
                <CardContent>
                  <Typography
                    gutterBottom
                    variant='h6'
                    component='div'
                    sx={{
                      WebkitLineClamp: '3',
                      WebkitBoxOrient: 'vertical',
                      display: '-webkit-box',
                      overflow: 'hidden',
                    }}
                  >
                    {title}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {artist_title}
                  </Typography>
                </CardContent>
              </CardWrapper>
            ) : null;
          })}
      </CardGrid>
      {!isInitialLoading && (
        <Button
          disabled={isSubsequentLoading}
          onClick={() => setSize((old) => old + 1)}
          sx={{ display: 'flex', gap: '0.5rem' }}
        >
          Load more
          {isSubsequentLoading && <CircularProgress size='1rem' />}
        </Button>
      )}
      {openArtwork !== undefined && <ArtworkModal artwork={openArtwork} onClose={() => setOpenArtwork(undefined)} />}
    </>
  );
};

export const ArtworkModal = ({ artwork, onClose }: { artwork: Artwork; onClose: () => void }) => {
  return (
    <Dialog open onClose={onClose}>
      <Card>
        <CardMedia
          component='img'
          image={`https://www.artic.edu/iiif/2/${artwork.image_id}/full/843,/0/default.jpg`}
          alt={`${artwork.title} by  ${artwork.image_id}`}
        />
      </Card>
    </Dialog>
  );
};

const HomePageWrapper = styled.main`
  min-height: 100vh;
  padding: 4rem;
  display: grid;
  place-items: center;
`;

const MaxWidthWrapper = styled.div`
  width: min(100%, 1000px);
  display: grid;
  place-items: center;
  gap: 2rem;
`;

const CardGrid = styled.div`
  width: 100%;
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr));
`;

const CardImageWrapper = styled.div`
  overflow: hidden;
`;

const CardWrapper = styled(Card)`
  cursor: pointer;

  img {
    transition: transform 0.5s;
  }

  &:hover,
  &:focus-visible {
    img {
      transform: scale(1.1);
    }
  }
`;

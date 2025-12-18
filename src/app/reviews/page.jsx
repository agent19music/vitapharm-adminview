"use client"

import { useContext, useState } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ChatCircleText, PaperPlaneTilt, Star } from "phosphor-react"
import SideNav from "../components/SideNav"
import { ReviewContext } from "../../context/ReviewContext"
import withAuth from "@/hoc/WithAuth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

function ReviewsPage() {
    const { reviews, stats, isLoading, replyToReview } = useContext(ReviewContext)
    const [replyingTo, setReplyingTo] = useState(null)
    const [replyText, setReplyText] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleReply = async (reviewId) => {
        if (!replyText.trim()) return

        setIsSubmitting(true)
        const result = await replyToReview(reviewId, replyText)
        if (result.success) {
            setReplyingTo(null)
            setReplyText("")
        }
        setIsSubmitting(false)
    }

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`h-4 w-4 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
            />
        ))
    }

    return (
        <div className="flex min-h-screen w-full flex-col pl-8">
            <SideNav />
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 ml-14">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.count}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold">{stats.average_rating.toFixed(1)}</span>
                                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">5-Star Reviews</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.rating_distribution[5] || 0}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Reviews List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Reviews</CardTitle>
                        <CardDescription>Reviews for your products - respond to build customer relationships</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <p className="text-muted-foreground">Loading reviews...</p>
                        ) : reviews.length === 0 ? (
                            <p className="text-muted-foreground">No reviews yet</p>
                        ) : (
                            <div className="space-y-6">
                                {reviews.map((review) => (
                                    <div key={review.id} className="border rounded-lg p-4 space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={review.user?.avatar} />
                                                    <AvatarFallback>{review.user?.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{review.user?.username || 'Anonymous'}</p>
                                                    <div className="flex items-center gap-1">
                                                        {renderStars(review.rating)}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-sm text-muted-foreground">
                                                {new Date(review.created_at).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <p className="text-sm text-muted-foreground">
                                            Product: <span className="font-medium text-foreground">{review.product_title}</span>
                                        </p>

                                        <p className="text-sm">{review.text}</p>

                                        {/* Existing Replies */}
                                        {review.replies?.map((reply, idx) => (
                                            <div key={idx} className="ml-6 p-3 bg-muted rounded-lg">
                                                <p className="text-sm font-medium mb-1">Your Response:</p>
                                                <p className="text-sm">{reply.text}</p>
                                            </div>
                                        ))}

                                        {/* Reply Button / Form */}
                                        {replyingTo === review.id ? (
                                            <div className="ml-6 space-y-2">
                                                <Textarea
                                                    placeholder="Write your reply..."
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    rows={3}
                                                />
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleReply(review.id)}
                                                        disabled={isSubmitting || !replyText.trim()}
                                                    >
                                                        <PaperPlaneTilt className="h-4 w-4 mr-1" />
                                                        {isSubmitting ? 'Sending...' : 'Send Reply'}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setReplyingTo(null)
                                                            setReplyText("")
                                                        }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            !review.replies?.length && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setReplyingTo(review.id)}
                                                >
                                                    <ChatCircleText className="h-4 w-4 mr-1" />
                                                    Reply
                                                </Button>
                                            )
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}

export default withAuth(ReviewsPage)
